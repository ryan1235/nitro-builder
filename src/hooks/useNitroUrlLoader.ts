import { useEffect } from 'react';
import { useBetween } from 'use-between';
import { SetLocalStorage } from '../api/utils/SetLocalStorage';
import { useNitroBundle } from './useNitroBundle';

const useNitroUrlLoaderHook = () => {
    const { importBundle = null } = useNitroBundle();

    useEffect(() => {
        const loadNitroFromUrl = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const mobi = urlParams.get('mobi');
                const autodownload = urlParams.get('autodownload');
                const hideMenu = urlParams.get('hideMenu');
                const furnitureType = urlParams.get('furnitureType');
                const hideStateInfo = urlParams.get('hideStateInfo');
                const autoRotateFurniture = urlParams.get('autoRotateFurniture');
                const autoRotateLeft = urlParams.get('autoRotateLeft');
                const autoRotateRight = urlParams.get('autoRotateRight');
                const autoZoomIn = urlParams.get('autoZoomIn');
                const autoZoomOut = urlParams.get('autoZoomOut');

                if (autodownload) SetLocalStorage('autodownload', autodownload);
                if (hideMenu) SetLocalStorage('hideMenu', hideMenu === 'true');
                if (furnitureType) {
                    const typeNumber = parseInt(furnitureType);
                    SetLocalStorage('furnitureType', typeNumber);
                    // Executa a função do botão "Usar mobi" o número de vezes especificado
                    SetLocalStorage('autoUseMobi', typeNumber);
                }
                if (hideStateInfo) SetLocalStorage('hideStateInfo', hideStateInfo === 'true');
                if (autoRotateFurniture) SetLocalStorage('autoRotateFurniture', autoRotateFurniture === 'true');
                if (autoRotateLeft) {
                    const leftNumber = parseInt(autoRotateLeft);
                    SetLocalStorage('autoRotateLeft', leftNumber);
                }
                if (autoRotateRight) {
                    const rightNumber = parseInt(autoRotateRight);
                    SetLocalStorage('autoRotateRight', rightNumber);
                }
                if (autoZoomIn) {
                    const zoomInNumber = parseInt(autoZoomIn);
                    SetLocalStorage('autoZoomIn', zoomInNumber);
                }
                if (autoZoomOut) {
                    const zoomOutNumber = parseInt(autoZoomOut);
                    SetLocalStorage('autoZoomOut', zoomOutNumber);
                }

                if (!mobi) return;

                const nitroUrl = `https://images.habblet.city/habblet-asset-bundles/libraries/furniture/${mobi}.nitro`;
                
                const response = await fetch(nitroUrl);
                if (!response.ok) throw new Error('Falha ao carregar o arquivo nitro');

                const arrayBuffer = await response.arrayBuffer();
                const file = new File([arrayBuffer], `${mobi}.nitro`, { type: 'application/octet-stream' });

                await importBundle(file);
            } catch (err) {
                console.error('Erro ao carregar arquivo nitro:', err);
            }
        };

        loadNitroFromUrl();
    }, [importBundle]);

    return {};
};

export const useNitroUrlLoader = () => useBetween(useNitroUrlLoaderHook); 
