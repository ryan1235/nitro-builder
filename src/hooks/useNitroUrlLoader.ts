import { useEffect } from 'react';
import { useBetween } from 'use-between';
import { SetLocalStorage } from '../api/utils/SetLocalStorage';
import { useNitroBundle } from './useNitroBundle';

const useNitroUrlLoaderHook = () => {
    const { importBundle = null } = useNitroBundle();

    const getRawParamFromUrl = (key: string): string => {
        const regex = new RegExp(`[?&]${ key }=([^&]+)`, 'i');
        const match = window.location.href.match(regex);

        if(!match || !match[1]) return null;

        try
        {
            return decodeURIComponent(match[1]);
        }
        catch
        {
            return match[1];
        }
    }

    const getBackgroundFromUrl = (): string => {
        const urlParams = new URLSearchParams(window.location.search);
        const backgroundParam = urlParams.get('background');

        if(backgroundParam) return backgroundParam;

        const backgroundMatch = window.location.href.match(/[?&]background=(#[0-9a-fA-F]{3,8})/i);

        if(backgroundMatch && backgroundMatch[1]) return backgroundMatch[1];

        const rawBackground = getRawParamFromUrl('background');

        if(rawBackground) return rawBackground;

        return null;
    }

    const getToolbarColorFromUrl = (): string => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolbarColorParam = urlParams.get('toolbarColor');

        if(toolbarColorParam) return toolbarColorParam;

        const toolbarColorMatch = window.location.href.match(/[?&]toolbarColor=(#[0-9a-fA-F]{3,8})/i);

        if(toolbarColorMatch && toolbarColorMatch[1]) return toolbarColorMatch[1];

        const rawToolbarColor = getRawParamFromUrl('toolbarColor');

        if(rawToolbarColor) return rawToolbarColor;

        return null;
    }

    const normalizeBackgroundValue = (value: string): string => {
        if(!value) return value;

        const imgurMatch = value.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/i);

        if(imgurMatch && imgurMatch[1]) return `https://i.imgur.com/${ imgurMatch[1] }`;

        return value;
    }

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
                const shadow = urlParams.get('shadow');
                const floor = urlParams.get('floor');
                const background = getBackgroundFromUrl();
                const toolbarColor = getToolbarColorFromUrl();

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
                if (shadow) SetLocalStorage('shadow', shadow === 'true');
                if (floor) SetLocalStorage('floor', floor === 'true');
                if (background) SetLocalStorage('background', normalizeBackgroundValue(background));
                if (toolbarColor) SetLocalStorage('toolbarColor', toolbarColor);

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
