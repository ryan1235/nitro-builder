import html2canvas from 'html2canvas';
import { FC, useEffect, useRef, useState } from 'react';
import { MdAspectRatio, MdPlayArrow, MdPrint, MdRotateLeft, MdRotateRight, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { GetPixi, IObjectData, IVector3D, RoomObjectCategory, RoomObjectVariable, Vector3d } from '../../api';
import { useLanguage, useNitroBundle } from '../../hooks';
import { Button, Flex, Tooltip } from '../../layout';
import { CenterRoom, CreatePlaneParser, FurnitureVisualization, GetRoomEngine, LegacyDataType, PrepareRoomEngine, RoomId, RoomObjectVisualizationFactory } from '../../nitro';
import { DispatchMouseEvent, SetActiveRoomId } from '../../utils';

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

    const printObject = () => {
        if (!elementRef.current) return;

        // Remove temporariamente os botões
        const buttons = elementRef.current.querySelector('.flex.absolute') as HTMLElement;
        if (buttons) buttons.style.display = 'none';

        // Configurações do html2canvas
        const options = {
            backgroundColor: null,
            scale: 2, // Aumenta a qualidade
            logging: false,
            useCORS: true,
            allowTaint: true,
            removeContainer: true,
            onclone: (clonedDoc) => {
                // Remove elementos indesejados do clone
                const elementsToRemove = clonedDoc.querySelectorAll('.flex.absolute, .pointer-events-none');
                elementsToRemove.forEach(el => el.remove());

                // Ajusta o canvas para remover o piso
                const canvas = clonedDoc.querySelector('canvas');
                if (canvas) {
                    // Aumenta a transparência do piso
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        
                        // Ajusta a transparência do piso (cor cinza escura)
                        for (let i = 0; i < data.length; i += 4) {
                            // Verifica se é um pixel do piso (cinza escuro)
                            if (data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50) {
                                data[i + 3] = 0; // Torna completamente transparente
                            }
                        }
                        
                        ctx.putImageData(imageData, 0, 0);
                    }
                }
            }
        };

        // Captura a tela
        html2canvas(elementRef.current, options).then(canvas => {
            // Restaura os botões
            if (buttons) buttons.style.display = 'flex';

            // Cria um canvas temporário para processamento adicional
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            // Configura o canvas temporário
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            // Desenha o canvas original
            tempCtx.drawImage(canvas, 0, 0);

            // Processa as sombras
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

            // Ajusta as sombras para ficarem mais suaves
            for (let i = 0; i < data.length; i += 4) {
                // Verifica se é uma sombra (pixels escuros com alpha)
                if (data[i + 3] > 0 && data[i + 3] < 255) {
                    // Suaviza a sombra
                    data[i + 3] = Math.min(data[i + 3] * 1.2, 255);
                }
            }

            tempCtx.putImageData(imageData, 0, 0);

            // Converte para PNG e faz o download
            const link = document.createElement('a');
            link.download = 'habbo-room.png';
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
        });
    }

    return (
        <div className="relative w-full h-full bg-white" ref={ elementRef }>
            { isRoomReady &&
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
