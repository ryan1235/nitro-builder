import { FC, useEffect, useRef, useState } from 'react';
import { MdAspectRatio, MdPlayArrow, MdPrint, MdRotateLeft, MdRotateRight, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { GetPixi, IObjectData, IVector3D, RoomObjectCategory, RoomObjectVariable, Vector3d } from '../../api';
import { GetLocalStorage } from '../../api/utils/GetLocalStorage';
import { EditorConfig } from '../../config';
import { useLanguage, useNitroBundle } from '../../hooks';
import { Button, Flex, Tooltip } from '../../layout';
import { CenterRoom, CreatePlaneParser, FurnitureVisualization, GetRoomEngine, LegacyDataType, PrepareRoomEngine, RoomId, RoomObjectVisualizationFactory } from '../../nitro';
import { DispatchMouseEvent, SetActiveRoomId } from '../../utils';

declare global {
    interface Window {
        lastNitroImageUrl?: string;
    }
}

const CANVAS_ID = 1;
const PREVIEW_OBJECT_ID = 1;
const PREVIEW_OBJECT_LOCATION_X = 5;
const PREVIEW_OBJECT_LOCATION_Y = 5;
let PREVIEW_COUNTER = 0;

export const EditorCanvas2Component: FC<{}> = props =>
{
    const { localizeText } = useLanguage();
    const [ isReady, setIsReady ] = useState<boolean>(false);
    const [ isRoomReady, setIsRoomReady ] = useState<boolean>(false);
    const [ currentRoomId, setCurrentRoomId ] = useState<number>(RoomId.makeRoomPreviewerId(++PREVIEW_COUNTER));
    const [ currentObjectId, setCurrentObjectId ] = useState<number>(-1);
    const [ currentObjectCategory, setCurrentObjectCategory ] = useState<number>(RoomObjectCategory.MINIMUM);
    
    // Estados para controlar o status das ações automáticas
    const [ autoUseMobiStatus, setAutoUseMobiStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    const [ autoRotateStatus, setAutoRotateStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    const [ autoRotateLeftStatus, setAutoRotateLeftStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    const [ autoRotateRightStatus, setAutoRotateRightStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    const [ autoZoomInStatus, setAutoZoomInStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    const [ autoZoomOutStatus, setAutoZoomOutStatus ] = useState<'idle' | 'running' | 'completed'>('idle');
    
    const { assetData = null, assets = null } = useNitroBundle();
    const elementRef = useRef<HTMLDivElement>();

    useEffect(() =>
    {
        if(!assetData || !assets || !isRoomReady) return;

        const addFurnitureIntoRoom = (objectId: number, type: string, direction: IVector3D, objectData: IObjectData = null, extra: string = null) =>
        {
            if((currentObjectId > -1) && (currentObjectCategory > RoomObjectCategory.MINIMUM))
            {
                const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);

                if(roomObject && roomObject.type === type && (roomObject.visualization instanceof (GetRoomEngine().visualizationFactory as RoomObjectVisualizationFactory).getVisualizationType(assetData.visualizationType)))
                {
                    (roomObject.visualization as FurnitureVisualization)._data.initialize(assetData.toJSON());

                    roomObject.model.forceRefresh();
                    
                    return;
                }
                else
                {
                    console.log('remove it')
                    GetRoomEngine().removeRoomObjectFloor(currentRoomId, currentObjectId);
                }
            }

            if(!objectData) objectData = new LegacyDataType();

            if(!GetRoomEngine().addFurnitureFloorByTypeName(currentRoomId, objectId, type, new Vector3d(PREVIEW_OBJECT_LOCATION_X, PREVIEW_OBJECT_LOCATION_Y, 0), direction, 0, objectData, NaN, -1, 0, -1, '', true, false)) return;
            
            const roomObject = GetRoomEngine().getRoomObject(currentRoomId, objectId, RoomObjectCategory.FLOOR);

            if(roomObject && extra) roomObject.model.setValue(RoomObjectVariable.FURNITURE_EXTRAS, extra);

            setCurrentObjectId(PREVIEW_OBJECT_ID);
            setCurrentObjectCategory(RoomObjectCategory.FLOOR);
        }

        const objectId = PREVIEW_OBJECT_ID;

        addFurnitureIntoRoom(objectId, assetData.name, new Vector3d(90))

        const camera = GetRoomEngine().getRoomCamera(currentRoomId);
        camera.targetId = objectId;
        camera.targetCategory = RoomObjectCategory.FLOOR;

        GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, 1.2);
        camera.activateFollowing(window.NitroBuilderConfig['camera.follow.duration']);

    }, [ assetData, assets, isRoomReady, currentRoomId, currentObjectId, currentObjectCategory ]);

    useEffect(() =>
    {
        if(!isRoomReady) return;

        const element = elementRef.current;

        const resizeObserver = new ResizeObserver(() =>
        {
            if(!element || !isRoomReady) return;

            GetRoomEngine().initializeRoomInstanceRenderingCanvas(currentRoomId, CANVAS_ID, Math.floor(element.clientWidth), Math.floor(element.clientHeight));
        });

        resizeObserver.observe(element);

        return () =>
        {
            resizeObserver.disconnect();
        }
    }, [ isRoomReady, currentRoomId ])

    useEffect(() =>
    {
        if(!isReady) return;

        const roomId = currentRoomId;
        const planeParser = CreatePlaneParser(10, 10);

        GetRoomEngine().createRoomInstance(roomId, planeParser.getMapData());

        planeParser.dispose();
        
        const element = elementRef.current;
        const width = Math.floor(element.clientWidth);
        const height = Math.floor(element.clientHeight);
        const pixi = GetPixi();
        const displayObject = GetRoomEngine().getRoomInstanceDisplay(currentRoomId, CANVAS_ID, width, height, 64);

        GetRoomEngine().setRoomInstanceRenderingCanvasMask(currentRoomId, CANVAS_ID, true);
        GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, 2);
        pixi.stage.addChild(displayObject);

        const camera = GetRoomEngine().getRoomCamera(currentRoomId);
        GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, 1.5);

        CenterRoom(currentRoomId, CANVAS_ID);
        SetActiveRoomId(currentRoomId);
        setIsRoomReady(true);

        return () =>
        {
            GetRoomEngine().destroyRoom(roomId);
            setIsReady(false);
        }
    }, [ currentRoomId, isReady ]);

    useEffect(() =>
    {
        const start = async () =>
        {
            const element = elementRef.current;
            const width = Math.floor(element.clientWidth);
            const height = Math.floor(element.clientHeight);

            await PrepareRoomEngine(width, height);

            const pixi = GetPixi();
            const canvas = pixi.canvas;

            canvas.onclick = event => DispatchMouseEvent(event);
            canvas.onmousemove = event => {
                DispatchMouseEvent(event);
                if (event.buttons === 1) { // Verifica se o botão esquerdo está pressionado
                    console.log('Coordenadas do mouse:', {
                        x: event.clientX,
                        y: event.clientY,
                        movementX: event.movementX,
                        movementY: event.movementY
                    });
                }
            };
            canvas.onmousedown = event => DispatchMouseEvent(event);
            canvas.onmouseup = event => DispatchMouseEvent(event);

            pixi.resizeTo = element;

            element.appendChild(canvas);

            setIsReady(true);
        }

        start();

        return () =>
        {
            setIsReady(false);
        }
    }, []);

    useEffect(() => {
        if(isRoomReady && assetData && currentObjectId !== -1) {
            const autodownload = GetLocalStorage('autodownload');
            const autoUseMobi = GetLocalStorage('autoUseMobi');
            
            console.log('[AUTO]', 'isRoomReady:', isRoomReady, 'assetData:', assetData, 'currentObjectId:', currentObjectId, 'autodownload:', autodownload, 'autoUseMobi:', autoUseMobi);
            
            // Executa automaticamente a função "Usar mobi" o número de vezes especificado
            if(autoUseMobi && Number(autoUseMobi) > 0) {
                console.log(`[AUTO] Executando changeObjectState() ${autoUseMobi} vezes automaticamente`);
                setAutoUseMobiStatus('running');
                
                let timesExecuted = 0;
                const executeUseMobi = () => {
                    if (timesExecuted < Number(autoUseMobi)) {
                        console.log(`[AUTO] Execução ${timesExecuted + 1} de ${autoUseMobi}`);
                        changeObjectState();
                        timesExecuted++;
                        
                        if (timesExecuted < Number(autoUseMobi)) {
                            // Agenda a próxima execução após 500ms
                            setTimeout(executeUseMobi, 500);
                        } else {
                            // Remove do localStorage quando terminar
                            window.localStorage.removeItem('autoUseMobi');
                            setAutoUseMobiStatus('completed');
                            console.log('[AUTO] Todas as execuções de autoUseMobi foram concluídas');
                        }
                    }
                };
                
                // Inicia a primeira execução após 1 segundo
                setTimeout(executeUseMobi, 1000);
            }

            // Executa rotação automática se solicitado (mais rápido - após 1s)
            if(EditorConfig.shouldAutoRotateFurniture()) {
                setAutoRotateStatus('running');
                setTimeout(() => {
                    console.log('[AUTO] Executando rotação automática');
                    rotateObject(true); // Rotaciona para direita
                    setAutoRotateStatus('completed');
                }, 1000); // 1 segundo após renderização (mais rápido)
            }

            // Executa rotação para esquerda o número de vezes especificado (mais rápido - após 1.5s, intervalo 100ms)
            const autoRotateLeft = EditorConfig.getAutoRotateLeft();
            if(autoRotateLeft && autoRotateLeft > 0) {
                setAutoRotateLeftStatus('running');
                setTimeout(() => {
                    console.log(`[AUTO] Executando rotação para esquerda ${autoRotateLeft} vezes`);
                    let timesExecuted = 0;
                    const executeRotateLeft = () => {
                        if (timesExecuted < autoRotateLeft) {
                            console.log(`[AUTO] Rotação esquerda ${timesExecuted + 1} de ${autoRotateLeft}`);
                            rotateObject(false); // Rotaciona para esquerda
                            timesExecuted++;
                            
                            if (timesExecuted < autoRotateLeft) {
                                setTimeout(executeRotateLeft, 100); // Intervalo mais rápido (100ms)
                            } else {
                                window.localStorage.removeItem('autoRotateLeft');
                                setAutoRotateLeftStatus('completed');
                                console.log('[AUTO] Todas as rotações para esquerda foram concluídas');
                            }
                        }
                    };
                    executeRotateLeft();
                }, 1500); // 1.5 segundos após renderização (mais rápido)
            }

            // Executa rotação para direita o número de vezes especificado (mais rápido - após 2s, intervalo 100ms)
            const autoRotateRight = EditorConfig.getAutoRotateRight();
            if(autoRotateRight && autoRotateRight > 0) {
                setAutoRotateRightStatus('running');
                setTimeout(() => {
                    console.log(`[AUTO] Executando rotação para direita ${autoRotateRight} vezes`);
                    let timesExecuted = 0;
                    const executeRotateRight = () => {
                        if (timesExecuted < autoRotateRight) {
                            console.log(`[AUTO] Rotação direita ${timesExecuted + 1} de ${autoRotateRight}`);
                            rotateObject(true); // Rotaciona para direita
                            timesExecuted++;
                            
                            if (timesExecuted < autoRotateRight) {
                                setTimeout(executeRotateRight, 100); // Intervalo mais rápido (100ms)
                            } else {
                                window.localStorage.removeItem('autoRotateRight');
                                setAutoRotateRightStatus('completed');
                                console.log('[AUTO] Todas as rotações para direita foram concluídas');
                            }
                        }
                    };
                    executeRotateRight();
                }, 2000); // 2 segundos após renderização (mais rápido)
            }

            // Executa zoom automático para aumentar (mais rápido - após 2.5s, intervalo 50ms)
            const autoZoomIn = EditorConfig.getAutoZoomIn();
            if(autoZoomIn && autoZoomIn > 0) {
                setAutoZoomInStatus('running');
                setTimeout(() => {
                    console.log(`[AUTO] Executando zoom in ${autoZoomIn} vezes`);
                    let timesExecuted = 0;
                    const executeZoomIn = () => {
                        if (timesExecuted < autoZoomIn) {
                            console.log(`[AUTO] Zoom in ${timesExecuted + 1} de ${autoZoomIn}`);
                            zoomIn();
                            timesExecuted++;
                            
                            if (timesExecuted < autoZoomIn) {
                                setTimeout(executeZoomIn, 50); // Intervalo mais rápido (50ms)
                            } else {
                                window.localStorage.removeItem('autoZoomIn');
                                setAutoZoomInStatus('completed');
                                console.log('[AUTO] Todos os zooms in foram concluídos');
                            }
                        }
                    };
                    executeZoomIn();
                }, 2500); // 2.5 segundos após renderização (mais rápido)
            }

            // Executa zoom automático para diminuir (mais rápido - após 3s, intervalo 50ms)
            const autoZoomOut = EditorConfig.getAutoZoomOut();
            if(autoZoomOut && autoZoomOut > 0) {
                setAutoZoomOutStatus('running');
                setTimeout(() => {
                    console.log(`[AUTO] Executando zoom out ${autoZoomOut} vezes`);
                    let timesExecuted = 0;
                    const executeZoomOut = () => {
                        if (timesExecuted < autoZoomOut) {
                            console.log(`[AUTO] Zoom out ${timesExecuted + 1} de ${autoZoomOut}`);
                            zoomOut();
                            timesExecuted++;
                            
                            if (timesExecuted < autoZoomOut) {
                                setTimeout(executeZoomOut, 50); // Intervalo mais rápido (50ms)
                            } else {
                                window.localStorage.removeItem('autoZoomOut');
                                setAutoZoomOutStatus('completed');
                                console.log('[AUTO] Todos os zooms out foram concluídos');
                            }
                        }
                    };
                    executeZoomOut();
                }, 3000); // 3 segundos após renderização (mais rápido)
            }
            
            if(autodownload) {
                setTimeout(() => {
                    // Aplica zoom 3x antes de salvar
                    console.log('[AUTO]', 'Aplicando zoom 3x');
                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, 3);
                    setTimeout(() => {
                        console.log('[AUTO]', 'Chamando printObject()');
                        printObject();
                        window.localStorage.removeItem('autodownload');
                        console.log('[AUTO]', 'autodownload removido do localStorage');
                    }, 300); // Pequeno delay para garantir o zoom
                }, 500); // 500ms para garantir renderização
            }
        }
    }, [isRoomReady, assetData, currentObjectId]);

    const zoomIn = () =>
    {
        let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID);

        switch(scale)
        {
            case 0.5:
                scale = 1;
                break;
            case 8:
                return;
            default:
                scale += 1;
        }

        GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, scale);
    }

    const zoomOut = () =>
    {
        let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID);

        switch(scale)
        {
            case 0.5:
                return;
            case 1:
                scale = 0.5;
                break;
            default:
                scale -= 1;
        }

        GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, scale);
    }

    const changeRoomGeometrySize = () =>
    {
        const geometry = GetRoomEngine().getRoomInstanceGeometry(currentRoomId, CANVAS_ID);

        geometry.scale = geometry.scale === 64 ? 1 : 64;
    }

    const changeObjectState = () => GetRoomEngine().changeObjectState(currentRoomId, currentObjectId, currentObjectCategory);

    /**
     * Muda para um estado específico do mobiliário
     * @param targetState - O estado específico para mudar (0, 1, 2, 3, etc.)
     * @returns true se o estado foi aplicado com sucesso
     */
    const changeToSpecificState = (targetState: number): boolean => {
        if(currentObjectId === -1) return false;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return false;

        try {
            // Tenta definir o estado específico
            roomObject.model.setValue(RoomObjectVariable.FURNITURE_AUTOMATIC_STATE_INDEX, targetState);
            roomObject.model.forceRefresh();
            
            // Verifica se o estado foi aplicado
            const appliedState = getCurrentObjectState();
            const success = appliedState === targetState;
            
            console.log('[DEBUG] Mudança para estado', targetState, '->', appliedState, 'Sucesso:', success);
            return success;
            
        } catch(e) {
            console.log('[DEBUG] Erro ao mudar para estado', targetState, ':', e);
            return false;
        }
    };

    /**
     * Obtém o número máximo de estados (UsarMobis) disponíveis para o mobiliário atual
     * @returns O número máximo de estados ou -1 se não for possível obter
     */
    const getMaxObjectStates = (): number => {
        if(currentObjectId === -1) return -1;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return -1;

        // Método 1: Tenta obter do assetData (mais confiável)
        if(assetData && (assetData as any).visualization) {
            try {
                // Verifica se há dados de visualização com estados
                const visualizationData = (assetData as any).visualization;
                
                // Verifica se há número de estados diretamente no asset
                if(visualizationData.states !== undefined) {
                    console.log('[DEBUG] Estados encontrados via assetData.visualization.states:', visualizationData.states);
                    return visualizationData.states;
                }
                
                // Verifica se há dados de animação com sequências
                if(visualizationData.animation && visualizationData.animation.sequences) {
                    const sequences = visualizationData.animation.sequences;
                    if(sequences.length > 0) {
                        console.log('[DEBUG] Estados encontrados via assetData.visualization.animation.sequences:', sequences.length);
                        return sequences.length;
                    }
                }
                
                // Verifica se há direções com estados
                if(visualizationData.directions && visualizationData.directions.length > 0) {
                    const directions = visualizationData.directions;
                    let maxStates = 0;
                    
                    directions.forEach((direction: any) => {
                        if(direction.layers) {
                            direction.layers.forEach((layer: any) => {
                                if(layer.animation && layer.animation.sequences) {
                                    maxStates = Math.max(maxStates, layer.animation.sequences.length);
                                }
                            });
                        }
                    });
                    
                    if(maxStates > 0) {
                        console.log('[DEBUG] Estados encontrados via assetData.visualization.directions:', maxStates);
                        return maxStates;
                    }
                }
                
                // Verifica se há dados de lógica com estados
                if(assetData.logic && (assetData.logic as any).states !== undefined) {
                    console.log('[DEBUG] Estados encontrados via assetData.logic.states:', (assetData.logic as any).states);
                    return (assetData.logic as any).states;
                }
                
                // Verifica se há dados de lógica com número de estados
                if(assetData.logic && (assetData.logic as any).stateCount !== undefined) {
                    console.log('[DEBUG] Estados encontrados via assetData.logic.stateCount:', (assetData.logic as any).stateCount);
                    return (assetData.logic as any).stateCount;
                }
                
                // Verifica se há dados de lógica com array de estados
                if(assetData.logic && (assetData.logic as any).stateArray && Array.isArray((assetData.logic as any).stateArray)) {
                    console.log('[DEBUG] Estados encontrados via assetData.logic.stateArray:', (assetData.logic as any).stateArray.length);
                    return (assetData.logic as any).stateArray.length;
                }
                
            } catch(e) {
                console.log('[DEBUG] Erro ao acessar assetData.visualization:', e);
            }
        }

        // Método 1.5: Inspeção profunda do assetData
        if(assetData) {
            try {
                console.log('[DEBUG] Inspeção completa do assetData:', assetData);
                
                // Procura por qualquer propriedade que contenha "state" ou "states"
                const assetKeys = Object.keys(assetData);
                const stateKeys = assetKeys.filter(key => 
                    key.toLowerCase().includes('state') || 
                    key.toLowerCase().includes('count') ||
                    key.toLowerCase().includes('max')
                );
                
                if(stateKeys.length > 0) {
                    console.log('[DEBUG] Chaves relacionadas a estados encontradas no asset:', stateKeys);
                    
                    for(const key of stateKeys) {
                        try {
                            // @ts-ignore
                            const value = assetData[key];
                            if(typeof value === 'number' && value > 0) {
                                console.log('[DEBUG] Valor numérico encontrado em', key, ':', value);
                                return value;
                            }
                            if(Array.isArray(value) && value.length > 0) {
                                console.log('[DEBUG] Array encontrado em', key, ':', value.length);
                                return value.length;
                            }
                        } catch(e) {
                            // Ignora erros de acesso
                        }
                    }
                }
                
                // Inspeção profunda da visualização
                if((assetData as any).visualization) {
                    const visKeys = Object.keys((assetData as any).visualization);
                    console.log('[DEBUG] Chaves da visualização:', visKeys);
                    
                    for(const key of visKeys) {
                        try {
                            const value = (assetData as any).visualization[key];
                            if(typeof value === 'number' && value > 0) {
                                console.log('[DEBUG] Valor numérico encontrado em visualization.' + key, ':', value);
                                return value;
                            }
                        } catch(e) {
                            // Ignora erros de acesso
                        }
                    }
                }
                
                // Inspeção profunda da lógica
                if(assetData.logic) {
                    const logicKeys = Object.keys(assetData.logic);
                    console.log('[DEBUG] Chaves da lógica:', logicKeys);
                    
                    for(const key of logicKeys) {
                        try {
                            const value = (assetData.logic as any)[key];
                            if(typeof value === 'number' && value > 0) {
                                console.log('[DEBUG] Valor numérico encontrado em logic.' + key, ':', value);
                                return value;
                            }
                        } catch(e) {
                            // Ignora erros de acesso
                        }
                    }
                }
                
            } catch(e) {
                console.log('[DEBUG] Erro na inspeção profunda do assetData:', e);
            }
        }

        // Método 2: Tenta obter do objeto da sala usando diferentes abordagens
        try {
            // Tenta acessar propriedades privadas usando type assertion
            if((roomObject as any)._states && Array.isArray((roomObject as any)._states)) {
                console.log('[DEBUG] Estados encontrados via _states:', (roomObject as any)._states.length);
                return (roomObject as any)._states.length;
            }
            
            // Tenta acessar propriedades privadas alternativas
            if((roomObject as any)._visualization && (roomObject as any)._visualization._states) {
                console.log('[DEBUG] Estados encontrados via _visualization._states:', (roomObject as any)._visualization._states.length);
                return (roomObject as any)._visualization._states.length;
            }
            
            // Tenta acessar propriedades privadas alternativas
            if((roomObject as any)._visualization && (roomObject as any)._visualization._animationStates) {
                console.log('[DEBUG] Estados encontrados via _visualization._animationStates:', (roomObject as any)._visualization._animationStates.length);
                return (roomObject as any)._visualization._animationStates.length;
            }
        } catch(e) {
            console.log('[DEBUG] Erro ao acessar propriedades privadas:', e);
        }

        // Método 3: Tenta obter do modelo usando diferentes variáveis
        try {
            const stateIndex = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_AUTOMATIC_STATE_INDEX);
            const furnitureData = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_DATA);
            
            if(!isNaN(stateIndex) && !isNaN(furnitureData)) {
                // Se temos dados de mobiliário, estimamos baseado no estado atual
                const estimatedStates = Math.max(stateIndex + 1, furnitureData + 1, 1);
                console.log('[DEBUG] Estados estimados via modelo (stateIndex:', stateIndex, 'furnitureData:', furnitureData, '):', estimatedStates);
                return estimatedStates;
            }
        } catch(e) {
            console.log('[DEBUG] Erro ao acessar modelo:', e);
        }

        // Método 4: Tenta obter via reflection/inspeção do objeto
        try {
            const objectKeys = Object.keys(roomObject);
            const stateKeys = objectKeys.filter(key => 
                key.toLowerCase().includes('state') || 
                key.toLowerCase().includes('animation') ||
                key.toLowerCase().includes('sequence')
            );
            
            if(stateKeys.length > 0) {
                console.log('[DEBUG] Chaves relacionadas a estados encontradas:', stateKeys);
                
                // Tenta acessar cada chave para encontrar arrays de estados
                for(const key of stateKeys) {
                    try {
                        // @ts-ignore
                        const value = roomObject[key];
                        if(Array.isArray(value) && value.length > 0) {
                            console.log('[DEBUG] Array de estados encontrado em', key, ':', value.length);
                            return value.length;
                        }
                    } catch(e) {
                        // Ignora erros de acesso
                    }
                }
            }
        } catch(e) {
            console.log('[DEBUG] Erro na inspeção do objeto:', e);
        }

                            // Fallback inteligente: baseado no estado atual
        const currentState = getCurrentObjectState();
        if(currentState > 0) {
            // Se o estado atual é maior que 0, o máximo deve ser pelo menos estado atual + 1
            const estimatedMax = currentState + 1;
            console.log('[DEBUG] Fallback inteligente: estado atual é', currentState, ', estimando máximo como', estimatedMax);
            return estimatedMax;
        }
        
        console.log('[DEBUG] Não foi possível determinar o número de estados, usando fallback padrão');
        
        // Executa debug automático para investigar
        setTimeout(() => {
            debugObjectStates();
        }, 1000);
        
        // Força atualização dos estados para tentar detectar corretamente
        setTimeout(() => {
            forceStateUpdate();
        }, 1500);
        
        // Testa valores de estado para determinar o máximo
        setTimeout(() => {
            testStateValues().then(testedMax => {
                if(testedMax > 0) {
                    console.log('[DEBUG] Teste automático concluído. Máximo de estados:', testedMax);
                }
            });
        }, 2000);
        
        return 1; // Pelo menos 1 estado sempre existe
        };

        /**
         * Força a atualização dos estados do mobiliário
         * Útil para garantir que os estados sejam detectados corretamente
         */
        const forceStateUpdate = () => {
            if(currentObjectId === -1) return;
            
            const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
            if(!roomObject) return;

            try {
                // Força refresh do modelo
                roomObject.model.forceRefresh();
                
                // Força refresh da visualização
                if(roomObject.visualization) {
                    if((roomObject.visualization as any).forceRefresh) {
                        (roomObject.visualization as any).forceRefresh();
                    }
                }
                
                console.log('[DEBUG] Forçada atualização dos estados do mobiliário');
                
                // Executa debug após atualização
                setTimeout(() => {
                    debugObjectStates();
                }, 500);
                
            } catch(e) {
                console.log('[DEBUG] Erro ao forçar atualização dos estados:', e);
            }
        };

        /**
         * Testa estados específicos para determinar o máximo
         * @returns Promise com o número máximo de estados encontrado
         */
        const testStateValues = (): Promise<number> => {
            return new Promise((resolve) => {
                if(currentObjectId === -1) {
                    resolve(-1);
                    return;
                }
                
                const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
                if(!roomObject) {
                    resolve(-1);
                    return;
                }

                try {
                    // Salva o estado original
                    const originalState = getCurrentObjectState();
                    console.log('[DEBUG] Estado original salvo:', originalState);
                    
                    // Primeiro, volta para o estado 0
                    const success = changeToSpecificState(0);
                    if(!success) {
                        console.log('[DEBUG] Não foi possível voltar ao estado 0');
                        resolve(1); // Fallback
                        return;
                    }
                    
                    // Aguarda um pouco para garantir que voltou ao estado 0
                    setTimeout(() => {
                        const initialState = getCurrentObjectState();
                        console.log('[DEBUG] Estado inicial:', initialState);
                        
                        // Testa estados específicos de 0 até encontrar o limite
                        let maxState = 0;
                        let foundLimit = false;
                        
                        // Função para testar o próximo estado
                        const testNextState = (testState: number) => {
                            if(testState > 20) { // Limite de segurança
                                console.log('[DEBUG] Limite de segurança atingido');
                                finishTest();
                                return;
                            }
                            
                            console.log('[DEBUG] Testando estado específico:', testState);
                            
                            // Tenta mudar para o estado específico
                            const success = changeToSpecificState(testState);
                            
                            if(success) {
                                // Estado aplicado com sucesso
                                maxState = testState;
                                console.log('[DEBUG] Estado', testState, 'aplicado com sucesso');
                                
                                // Testa o próximo estado
                                setTimeout(() => {
                                    testNextState(testState + 1);
                                }, 100);
                                
                            } else {
                                // Estado não pôde ser aplicado, chegamos ao limite
                                console.log('[DEBUG] Estado', testState, 'não pôde ser aplicado. Limite atingido.');
                                foundLimit = true;
                                finishTest();
                            }
                        };
                        
                        // Função para finalizar o teste
                        const finishTest = () => {
                            // Restaura o estado original
                            changeToSpecificState(originalState);
                            
                            const result = maxState + 1; // +1 porque os estados começam em 0
                            console.log('[DEBUG] Teste concluído. Máximo estado aplicável:', maxState);
                            console.log('[DEBUG] Máximo de estados encontrado:', result);
                            
                            resolve(result);
                        };
                        
                        // Inicia o teste com o estado 0
                        testNextState(0);
                        
                    }, 200);
                    
                } catch(e) {
                    console.log('[DEBUG] Erro no teste de estados:', e);
                    resolve(-1);
                }
            });
        };

    /**
     * Testa e valida os estados do mobiliário para debug
     * @returns Informações de debug sobre os estados
     */
    const debugObjectStates = () => {
        if(currentObjectId === -1) return null;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return null;

        const debugInfo: any = {
            timestamp: new Date().toISOString(),
            objectId: currentObjectId,
            objectType: roomObject.type,
            
            // Informações do asset
            assetName: assetData?.name,
            assetVisualizationType: assetData?.visualizationType,
            
            // Estados calculados
            calculatedMaxStates: getMaxObjectStates(),
            calculatedCurrentState: getCurrentObjectState(),
            
            // Propriedades do objeto
            objectKeys: Object.keys(roomObject),
            modelKeys: Object.keys(roomObject.model),
            
            // Valores do modelo
            modelValues: {}
        };

        // Coleta todos os valores do modelo
        try {
            const modelKeys = Object.keys(roomObject.model);
            modelKeys.forEach(key => {
                try {
                    // @ts-ignore
                    const value = roomObject.model[key];
                    if(value !== undefined && value !== null) {
                        debugInfo.modelValues[key] = value;
                    }
                } catch(e) {
                    debugInfo.modelValues[key] = 'ERRO_ACESSO';
                }
            });
        } catch(e) {
            debugInfo.modelValuesError = e.message;
        }

        // Inspeção profunda do objeto
        try {
            if((roomObject as any)._visualization) {
                debugInfo.visualizationKeys = Object.keys((roomObject as any)._visualization);
                if((roomObject as any)._visualization._data) {
                    debugInfo.visualizationDataKeys = Object.keys((roomObject as any)._visualization._data);
                }
            }
        } catch(e) {
            debugInfo.visualizationError = e.message;
        }

        console.log('[DEBUG] Informações completas de debug dos estados:', debugInfo);
        return debugInfo;
    };

    /**
     * Obtém informações detalhadas sobre o mobiliário
     * @returns Objeto com informações detalhadas do mobiliário
     */
    const getDetailedObjectInfo = () => {
        if(currentObjectId === -1) return null;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return null;

        try {
            const info: any = {
                // Informações básicas
                id: currentObjectId,
                type: roomObject.type,
                category: currentObjectCategory,
                
                // Posição e direção
                location: roomObject.getLocation(),
                direction: roomObject.getDirection(),
                
                // Estados
                currentState: getCurrentObjectState(),
                maxStates: getMaxObjectStates(),
                
                // Dados do modelo
                modelData: roomObject.model.getValue(RoomObjectVariable.FURNITURE_DATA) || 0,
                extras: roomObject.model.getValue(RoomObjectVariable.FURNITURE_EXTRAS) || '',
                stateIndex: roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_AUTOMATIC_STATE_INDEX) || 0,
                
                // Informações de visualização
                visualizationType: roomObject.visualization?.constructor?.name || 'Unknown',
                
                // Zoom atual
                currentZoom: GetRoomEngine().getRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID),
                
                // Informações da sala
                roomId: currentRoomId,
                canvasId: CANVAS_ID
            };

            // Tenta obter informações adicionais do objeto
            try {
                // Acessando propriedades privadas para mais informações
                if((roomObject as any)._states) {
                    info.statesArray = (roomObject as any)._states.length;
                    info.statesContent = (roomObject as any)._states;
                }
                
                if((roomObject as any)._visualization) {
                    info.visualizationData = (roomObject as any)._visualization._data;
                }
            } catch(e) {
                info.privateAccessError = e.message;
            }

            return info;
        } catch(e) {
            console.log('[DEBUG] Erro ao obter informações detalhadas:', e);
            return null;
        }
    };

    /**
     * Obtém o estado atual do mobiliário
     * @returns O estado atual ou -1 se não for possível obter
     */
    const getCurrentObjectState = (): number => {
        if(currentObjectId === -1) return -1;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return -1;

        try {
            // Método 1: Tenta obter do modelo usando diferentes variáveis
            const stateIndex = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_AUTOMATIC_STATE_INDEX);
            const furnitureData = roomObject.model.getValue<number>(RoomObjectVariable.FURNITURE_DATA);
            
            if(!isNaN(stateIndex)) {
                console.log('[DEBUG] Estado atual via FURNITURE_AUTOMATIC_STATE_INDEX:', stateIndex);
                return stateIndex;
            }
            
            if(!isNaN(furnitureData)) {
                console.log('[DEBUG] Estado atual via FURNITURE_DATA:', furnitureData);
                return furnitureData;
            }
            
            // Método 2: Tenta obter de propriedades privadas da visualização
            try {
                if((roomObject as any)._visualization) {
                    if((roomObject as any)._visualization._currentState !== undefined) {
                        console.log('[DEBUG] Estado atual via _visualization._currentState:', (roomObject as any)._visualization._currentState);
                        return (roomObject as any)._visualization._currentState;
                    }
                    
                    if((roomObject as any)._visualization._state !== undefined) {
                        console.log('[DEBUG] Estado atual via _visualization._state:', (roomObject as any)._visualization._state);
                        return (roomObject as any)._visualization._state;
                    }
                    
                    if((roomObject as any)._visualization._animationState !== undefined) {
                        console.log('[DEBUG] Estado atual via _visualization._animationState:', (roomObject as any)._visualization._animationState);
                        return (roomObject as any)._visualization._animationState;
                    }
                    
                    if((roomObject as any)._visualization._data && (roomObject as any)._visualization._data.state !== undefined) {
                        console.log('[DEBUG] Estado atual via _visualization._data.state:', (roomObject as any)._visualization._data.state);
                        return (roomObject as any)._visualization._data.state;
                    }
                }
            } catch(e) {
                console.log('[DEBUG] Erro ao acessar propriedades privadas da visualização:', e);
            }
            
            // Método 3: Tenta obter do assetData se disponível
            if(assetData && (assetData as any).visualization) {
                try {
                    // Verifica se há estado atual no asset
                    if((assetData as any).visualization.currentState !== undefined) {
                        console.log('[DEBUG] Estado atual via assetData.visualization.currentState:', (assetData as any).visualization.currentState);
                        return (assetData as any).visualization.currentState;
                    }
                } catch(e) {
                    console.log('[DEBUG] Erro ao acessar assetData.visualization.currentState:', e);
                }
            }
            
            // Método 4: Fallback para 0 (estado inicial)
            console.log('[DEBUG] Estado atual não encontrado, usando fallback 0');
            return 0;
            
        } catch(e) {
            console.log('[DEBUG] Erro ao obter estado atual:', e);
            return 0;
        }
    };

    const rotateObject = (clockwise: boolean) => {
        if(currentObjectId === -1) return;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return;

        const direction = roomObject.getDirection();
        let newDirection;
        
        if(clockwise) {
            newDirection = new Vector3d((direction.x + 2) % 8);
        } else {
            newDirection = new Vector3d((direction.x + 6) % 8);
        }
        
        roomObject.setDirection(newDirection);
        roomObject.model.forceRefresh();
    }

    const moveObjectUp = () => {
        if(currentObjectId === -1) return;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return;

        const location = roomObject.getLocation();
        const newLocation = new Vector3d(location.x, location.y - 1, location.z);
        
        roomObject.setLocation(newLocation);
        roomObject.model.forceRefresh();
    }

    const moveObjectDown = () => {
        if(currentObjectId === -1) return;
        
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) return;

        const location = roomObject.getLocation();
        const newLocation = new Vector3d(location.x, location.y + 1, location.z);
        
        roomObject.setLocation(newLocation);
        roomObject.model.forceRefresh();
    }

    // Função para detectar pixels coloridos nas bordas da imagem
    const hasColoredPixelsOnBorders = (imageData: ImageData): boolean => {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Verifica bordas superior e inferior
        for (let x = 0; x < width; x++) {
            // Borda superior
            const topIndex = (0 * width + x) * 4;
            if (data[topIndex + 3] > 0) { // Se não é transparente
                const r = data[topIndex];
                const g = data[topIndex + 1];
                const b = data[topIndex + 2];
                // Se não é branco puro (255, 255, 255)
                if (!(r === 255 && g === 255 && b === 255)) {
                    console.log('[BORDER_CHECK]', 'Pixel colorido encontrado na borda superior:', { x, r, g, b });
                    return true;
                }
            }
            
            // Borda inferior
            const bottomIndex = ((height - 1) * width + x) * 4;
            if (data[bottomIndex + 3] > 0) { // Se não é transparente
                const r = data[bottomIndex];
                const g = data[bottomIndex + 1];
                const b = data[bottomIndex + 2];
                // Se não é branco puro (255, 255, 255)
                if (!(r === 255 && g === 255 && b === 255)) {
                    console.log('[BORDER_CHECK]', 'Pixel colorido encontrado na borda inferior:', { x, r, g, b });
                    return true;
                }
            }
        }
        
        // Verifica bordas esquerda e direita
        for (let y = 0; y < height; y++) {
            // Borda esquerda
            const leftIndex = (y * width + 0) * 4;
            if (data[leftIndex + 3] > 0) { // Se não é transparente
                const r = data[leftIndex];
                const g = data[leftIndex + 1];
                const b = data[leftIndex + 2];
                // Se não é branco puro (255, 255, 255)
                if (!(r === 255 && g === 255 && b === 255)) {
                    console.log('[BORDER_CHECK]', 'Pixel colorido encontrado na borda esquerda:', { y, r, g, b });
                    return true;
                }
            }
            
            // Borda direita
            const rightIndex = (y * width + (width - 1)) * 4;
            if (data[rightIndex + 3] > 0) { // Se não é transparente
                const r = data[rightIndex];
                const g = data[rightIndex + 1];
                const b = data[rightIndex + 2];
                // Se não é branco puro (255, 255, 255)
                if (!(r === 255 && g === 255 && b === 255)) {
                    console.log('[BORDER_CHECK]', 'Pixel colorido encontrado na borda direita:', { y, r, g, b });
                    return true;
                }
            }
        }
        
        console.log('[BORDER_CHECK]', 'Nenhum pixel colorido encontrado nas bordas');
        return false;
    };

    // Função para processar e baixar a imagem com verificação de bordas
    const processAndDownloadImage = (canvas: HTMLCanvasElement, roomObject: any, currentZoom: number, maxZoom: number = 10) => {
        const pixi = GetPixi();
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        if (!tempCtx) {
            console.log('[AUTO]', 'processAndDownloadImage: tempCtx não criado');
            return;
        }
        
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const img = new Image();
        
        img.onload = () => {
            tempCtx.drawImage(img, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Verifica se há pixels coloridos nas bordas
            const hasColoredBorders = hasColoredPixelsOnBorders(imageData);
            
            if (hasColoredBorders && currentZoom > 1) {
                console.log('[AUTO]', `Imagem cortada detectada no zoom ${currentZoom}, reduzindo zoom para ${currentZoom - 1}`);
                
                // Reduz o zoom e tenta novamente
                const newZoom = currentZoom - 1;
                GetRoomEngine().setRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID, newZoom);
                
                // Aguarda um pouco para o zoom ser aplicado e tenta novamente
                setTimeout(() => {
                    roomObject.model.forceRefresh();
                    pixi.renderer.render(pixi.stage);
                    const newDataUrl = canvas.toDataURL('image/png', 1.0);
                    processAndDownloadImage(canvas, roomObject, newZoom, maxZoom);
                }, 200);
                return;
            }
            
            // Se chegou aqui, a imagem está OK ou é o zoom mínimo
            console.log('[AUTO]', `Processando imagem com zoom ${currentZoom} (${hasColoredBorders ? 'cortada mas zoom mínimo' : 'sem cortes'})`);
            
            // Processa a imagem removendo fundo branco
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
                    data[i + 3] = 0;
                }
            }
            tempCtx.putImageData(imageData, 0, 0);
            
            // Cria e executa o download
            const link = document.createElement('a');
            const direction = roomObject.getDirection().x;
            const state = roomObject.model.getValue(RoomObjectVariable.FURNITURE_DATA) || 0;
            const extras = roomObject.model.getValue(RoomObjectVariable.FURNITURE_EXTRAS) || '';
            const fileName = `${assetData?.name || 'nitro-object'}_dir${direction}_state${state}${extras ? '_' + extras : ''}_zoom${currentZoom}_${Date.now()}.png`;
            const finalDataUrl = tempCanvas.toDataURL('image/png', 1.0);
            link.download = fileName;
            link.href = finalDataUrl;
            link.click();
            console.log('[AUTO]', 'printObject: download iniciado', fileName);
            console.log('[AUTO]', 'printObject: dataUrl para uso externo:', finalDataUrl);
            window.lastNitroImageUrl = finalDataUrl;
        };
        
        img.src = canvas.toDataURL('image/png', 1.0);
    };

    const printObject = () => {
        if(currentObjectId === -1) {
            console.log('[AUTO]', 'printObject: currentObjectId === -1');
            return;
        }
        const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
        if(!roomObject) {
            console.log('[AUTO]', 'printObject: roomObject não encontrado');
            return;
        }
        
        // Força uma atualização do estado atual
        roomObject.model.forceRefresh();
        const pixi = GetPixi();
        const canvas = pixi.canvas;
        
        // Garante que o canvas está renderizado com o estado atual
        pixi.renderer.render(pixi.stage);
        
        // Obtém o zoom atual
        const currentZoom = GetRoomEngine().getRoomInstanceRenderingCanvasScale(currentRoomId, CANVAS_ID);
        console.log('[AUTO]', `printObject: iniciando com zoom ${currentZoom}`);
        
        // Processa a imagem com verificação de bordas
        processAndDownloadImage(canvas, roomObject, currentZoom);
    };

    return (
        <div className="relative w-full h-full bg-white" ref={ elementRef }>
            {/* Informações de estado escondidas (canto superior direito) */}
            { isRoomReady && assetData && currentObjectId !== -1 && !EditorConfig.shouldHideStateInfo() && (() => {
                const roomObject = GetRoomEngine().getRoomObject(currentRoomId, currentObjectId, currentObjectCategory);
                const detailedInfo = getDetailedObjectInfo();
                return (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-90 text-white text-xs p-4 rounded-lg font-mono max-w-sm overflow-y-auto max-h-96">
                        <div className="mb-3 font-bold text-sm border-b border-gray-600 pb-2">📊 Info Detalhada do Mobiliário</div>
                        
                        {/* Informações básicas */}
                        <div className="mb-2">
                            <div className="font-semibold text-yellow-300">📋 Básico</div>
                            <div>Nome: {assetData.name}</div>
                            <div>ID: {detailedInfo?.id || 'N/A'}</div>
                            <div>Tipo: {detailedInfo?.type || 'N/A'}</div>
                            <div>Categoria: {detailedInfo?.category || 'N/A'}</div>
                        </div>

                        {/* Estados */}
                        <div className="mb-2">
                            <div className="font-semibold text-green-300">🔄 Estados</div>
                            <div>Atual: {getCurrentObjectState()}</div>
                            <div>Máximo: {getMaxObjectStates()}</div>
                            <div>Índice: {detailedInfo?.stateIndex || 'N/A'}</div>
                            <div>Dados: {detailedInfo?.modelData || 'N/A'}</div>
                            <div>Extras: {detailedInfo?.extras || 'Nenhum'}</div>
                        </div>

                        {/* Status das Ações Automáticas */}
                        <div className="mb-2">
                            <div className="font-semibold text-cyan-300">⚡ Ações Automáticas</div>
                            <div className="text-xs space-y-1">
                                {GetLocalStorage('autoUseMobi') && Number(GetLocalStorage('autoUseMobi')) > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span>🎯 Usar Mobi:</span>
                                        <span className={autoUseMobiStatus === 'completed' ? 'text-green-400' : autoUseMobiStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoUseMobiStatus === 'completed' ? '✅ Concluído' : autoUseMobiStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                                {EditorConfig.shouldAutoRotateFurniture() && (
                                    <div className="flex items-center gap-2">
                                        <span>🔄 Rotação:</span>
                                        <span className={autoRotateStatus === 'completed' ? 'text-green-400' : autoRotateStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoRotateStatus === 'completed' ? '✅ Concluído' : autoRotateStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                                {EditorConfig.getAutoRotateLeft() > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span>⬅️ Rot. Esquerda:</span>
                                        <span className={autoRotateLeftStatus === 'completed' ? 'text-green-400' : autoRotateLeftStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoRotateLeftStatus === 'completed' ? '✅ Concluído' : autoRotateLeftStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                                {EditorConfig.getAutoRotateRight() > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span>➡️ Rot. Direita:</span>
                                        <span className={autoRotateRightStatus === 'completed' ? 'text-green-400' : autoRotateRightStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoRotateRightStatus === 'completed' ? '✅ Concluído' : autoRotateRightStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                                {EditorConfig.getAutoZoomIn() > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span>🔍 Zoom In:</span>
                                        <span className={autoZoomInStatus === 'completed' ? 'text-green-400' : autoZoomInStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoZoomInStatus === 'completed' ? '✅ Concluído' : autoZoomInStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                                {EditorConfig.getAutoZoomOut() > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span>🔍 Zoom Out:</span>
                                        <span className={autoZoomOutStatus === 'completed' ? 'text-green-400' : autoZoomOutStatus === 'running' ? 'text-yellow-300' : 'text-gray-400'}>
                                            {autoZoomOutStatus === 'completed' ? '✅ Concluído' : autoZoomOutStatus === 'running' ? '🔄 Executando...' : '⏸️ Aguardando'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Posição e direção */}
                        <div className="mb-2">
                            <div className="font-semibold text-blue-300">📍 Posição</div>
                            <div>X: {roomObject?.getLocation()?.x || 0}</div>
                            <div>Y: {roomObject?.getLocation()?.y || 0}</div>
                            <div>Z: {roomObject?.getLocation()?.z || 0}</div>
                            <div>Direção: {roomObject?.getDirection()?.x || 0}°</div>
                        </div>

                        {/* Zoom e renderização */}
                        <div className="mb-2">
                            <div className="font-semibold text-purple-300">🔍 Renderização</div>
                            <div>Zoom: {detailedInfo?.currentZoom || 'N/A'}</div>
                            <div>Canvas: {detailedInfo?.canvasId || 'N/A'}</div>
                            <div>Sala: {detailedInfo?.roomId || 'N/A'}</div>
                        </div>

                        {/* Informações técnicas */}
                        <div className="mb-2">
                            <div className="font-semibold text-orange-300">⚙️ Técnico</div>
                            <div>Visualização: {detailedInfo?.visualizationType || 'N/A'}</div>
                            <div>Array Estados: {detailedInfo?.statesArray || 'N/A'}</div>
                        </div>

                        {/* Dados do asset */}
                        <div className="mb-2">
                            <div className="font-semibold text-pink-300">🎨 Asset</div>
                            <div>Tipo Vis: {assetData.visualizationType}</div>
                            <div>Lógica: {assetData.logicType}</div>
                            <div>Direções: {(assetData as any).directions?.length || 'N/A'}</div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                            Atualizado: {new Date().toLocaleTimeString()}
                        </div>
                        
                        {/* Botões de Debug */}
                        <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
                            <button 
                                onClick={debugObjectStates}
                                className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                                🔍 Debug Estados
                            </button>
                            <button 
                                onClick={forceStateUpdate}
                                className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                                🔄 Forçar Atualização
                            </button>
                            <button 
                                onClick={testStateValues}
                                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            >
                                🧪 Testar Estados
                            </button>
                        </div>
                        
                        {/* Teste de Estados Específicos */}
                        <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
                            <div className="text-xs text-gray-400 mb-1">Testar Estado Específico:</div>
                            <div className="flex gap-1">
                                {[0, 1, 2, 3, 4, 5].map(state => (
                                    <button 
                                        key={state}
                                        onClick={() => changeToSpecificState(state)}
                                        className="flex-1 px-1 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            { isRoomReady && !EditorConfig.shouldHideAllButtons() && !EditorConfig.shouldHideMenu() &&
                <Flex className="absolute gap-1.5 p-2 bg-[#6A3B8F] rounded-lg bg-opacity-95 bottom-4 left-1/2 transform -translate-x-1/2 justify-center shadow-xl backdrop-blur-sm border border-[#8A4BAF]/20">
                    <Flex className="gap-1.5 justify-center">
                        <Tooltip content="Diminuir zoom">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => zoomOut() }>
                                <MdZoomOut className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Aumentar zoom">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => zoomIn() }>
                                <MdZoomIn className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Alterar tamanho">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => changeRoomGeometrySize() }>
                                <MdAspectRatio className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Usar mobi">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => changeObjectState() }>
                                <MdPlayArrow className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Girar para esquerda">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => rotateObject(false) }>
                                <MdRotateLeft className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Girar para direita">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => rotateObject(true) }>
                                <MdRotateRight className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Salvar imagem">
                            <Button
                                color="dark"
                                size="sm"
                                className="bg-[#8A4BAF] hover:bg-[#9B5CC0] text-white min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 border border-[#9B5CC0]/30"
                                onClick={ () => printObject() }>
                                <MdPrint className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </Flex>
                </Flex> }
        </div>  
    );
}
