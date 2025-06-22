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

                if (autodownload) SetLocalStorage('autodownload', autodownload);

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
