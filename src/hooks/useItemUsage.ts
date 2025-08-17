import { useCallback, useState } from 'react';
import { EditorConfig } from '../config';

/**
 * Hook para gerenciar o uso de itens com limites máximos
 */
export const useItemUsage = (itemType: string) => {
    const [currentUses, setCurrentUses] = useState<number>(0);
    
    const maxUses = EditorConfig.getItemUsageLimit(itemType);
    const remainingUses = EditorConfig.getRemainingUses(itemType, currentUses);
    const canUse = EditorConfig.canUseItem(itemType, currentUses);

    /**
     * Tenta usar o item
     * @returns true se o item foi usado com sucesso, false se não pode mais ser usado
     */
    const useItem = useCallback((): boolean => {
        if (!canUse) {
            return false;
        }
        
        setCurrentUses(prev => prev + 1);
        return true;
    }, [canUse]);

    /**
     * Reseta o contador de uso do item
     */
    const resetUsage = useCallback((): void => {
        setCurrentUses(0);
    }, []);

    /**
     * Define um número específico de usos
     * @param uses - O número de usos para definir
     */
    const setUsage = useCallback((uses: number): void => {
        setCurrentUses(Math.max(0, Math.min(uses, maxUses)));
    }, [maxUses]);

    /**
     * Obtém informações sobre o uso do item
     */
    const getUsageInfo = useCallback(() => ({
        currentUses,
        maxUses,
        remainingUses,
        canUse,
        usagePercentage: (currentUses / maxUses) * 100
    }), [currentUses, maxUses, remainingUses, canUse]);

    return {
        currentUses,
        maxUses,
        remainingUses,
        canUse,
        useItem,
        resetUsage,
        setUsage,
        getUsageInfo
    };
};
