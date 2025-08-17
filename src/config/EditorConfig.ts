/**
 * Configurações do Editor Nitro Builder
 */
export class EditorConfig 
{
    /**
     * Variável para esconder todos os botões da interface
     * Quando true, todos os botões serão ocultados
     */
    public static readonly HIDE_ALL_BUTTONS: boolean = false;

    /**
     * Variável para esconder o menu principal da interface
     * Quando true, o menu será ocultado
     */
    public static readonly HIDE_MENU: boolean = false;

    /**
     * Variável para definir qual tipo de mobiliário usar por padrão
     * Valores: 1, 2, 3, etc. (corresponde aos tipos disponíveis)
     */
    public static readonly DEFAULT_FURNITURE_TYPE: number = 1;

    /**
     * Variável para esconder as informações de estados do mobiliário
     * Quando true, as informações de estados ficam ocultas
     */
    public static readonly HIDE_STATE_INFO: boolean = true; // Por padrão, fica escondido

    /**
     * Variável para rotacionar o mobiliário automaticamente
     * Quando true, o mobiliário é rotacionado automaticamente
     */
    public static readonly AUTO_ROTATE_FURNITURE: boolean = false;

    /**
     * Variável para definir quantas vezes rotacionar para a esquerda
     * Quando > 0, executa rotação para esquerda o número de vezes especificado
     */
    public static readonly AUTO_ROTATE_LEFT: number = 0;

    /**
     * Variável para definir quantas vezes rotacionar para a direita
     * Quando > 0, executa rotação para direita o número de vezes especificado
     */
    public static readonly AUTO_ROTATE_RIGHT: number = 0;

    /**
     * Variável para definir o zoom automático
     * Quando > 0, aplica zoom o número de vezes especificado
     */
    public static readonly AUTO_ZOOM_IN: number = 0;

    /**
     * Variável para definir o zoom automático para diminuir
     * Quando > 0, diminui o zoom o número de vezes especificado
     */
    public static readonly AUTO_ZOOM_OUT: number = 0;

    /**
     * Variável para definir o número máximo de vezes que um item pode ser usado
     * Este valor será aplicado a todos os itens que não tenham um limite específico
     */
    public static readonly DEFAULT_MAX_ITEM_USES: number = 100;

    /**
     * Mapeamento de tipos de itens para seus limites de uso específicos
     * Se um item não estiver listado aqui, será usado o DEFAULT_MAX_ITEM_USES
     */
    public static readonly ITEM_USAGE_LIMITS: { [key: string]: number } = {
        // Mobiliário básico
        'furniture_basic': 50,
        'furniture_rare': 25,
        'furniture_limited': 10,
        
        // Itens especiais
        'special_item': 5,
        'consumable': 1,
        'one_time_use': 1,
        
        // Mobiliário de evento
        'event_furniture': 30,
        'seasonal_furniture': 20,
        
        // Itens de avatar
        'avatar_item': 100,
        'pet_item': 75,
        
        // Mobiliário de sala
        'room_furniture': 200,
        'wall_furniture': 150,
        'floor_furniture': 100
    };

    /**
     * Obtém o limite de uso para um tipo específico de item
     * @param itemType - O tipo do item
     * @returns O número máximo de usos para o item
     */
    public static getItemUsageLimit(itemType: string): number 
    {
        return this.ITEM_USAGE_LIMITS[itemType] || this.DEFAULT_MAX_ITEM_USES;
    }

    /**
     * Verifica se todos os botões devem ser escondidos
     * @returns true se os botões devem ser escondidos
     */
    public static shouldHideAllButtons(): boolean 
    {
        return this.HIDE_ALL_BUTTONS;
    }

    /**
     * Verifica se o menu deve ser escondido
     * @returns true se o menu deve ser escondido
     */
    public static shouldHideMenu(): boolean 
    {
        try 
        {
            const hideMenu = localStorage.getItem('hideMenu');
            return hideMenu ? JSON.parse(hideMenu) : this.HIDE_MENU;
        }
        catch 
        {
            return this.HIDE_MENU;
        }
    }

    /**
     * Obtém o tipo de mobiliário padrão
     * @returns O número do tipo de mobiliário padrão
     */
    public static getDefaultFurnitureType(): number 
    {
        try 
        {
            const furnitureType = localStorage.getItem('furnitureType');
            return furnitureType ? parseInt(furnitureType) : this.DEFAULT_FURNITURE_TYPE;
        }
        catch 
        {
            return this.DEFAULT_FURNITURE_TYPE;
        }
    }

    /**
     * Verifica se um item específico pode ser usado
     * @param itemType - O tipo do item
     * @param currentUses - O número atual de usos
     * @returns true se o item ainda pode ser usado
     */
    public static canUseItem(itemType: string, currentUses: number): boolean 
    {
        const maxUses = this.getItemUsageLimit(itemType);
        return currentUses < maxUses;
    }

    /**
     * Obtém o número restante de usos para um item
     * @param itemType - O tipo do item
     * @param currentUses - O número atual de usos
     * @returns O número de usos restantes
     */
    public static getRemainingUses(itemType: string, currentUses: number): number 
    {
        const maxUses = this.getItemUsageLimit(itemType);
        return Math.max(0, maxUses - currentUses);
    }

    /**
     * Verifica se as informações de estados devem ser escondidas
     * @returns true se as informações de estados devem ser escondidas
     */
    public static shouldHideStateInfo(): boolean 
    {
        try 
        {
            const hideStateInfo = localStorage.getItem('hideStateInfo');
            return hideStateInfo ? JSON.parse(hideStateInfo) : this.HIDE_STATE_INFO;
        }
        catch 
        {
            return this.HIDE_STATE_INFO;
        }
    }

    /**
     * Verifica se o mobiliário deve ser rotacionado automaticamente
     * @returns true se o mobiliário deve ser rotacionado automaticamente
     */
    public static shouldAutoRotateFurniture(): boolean 
    {
        try 
        {
            const autoRotateFurniture = localStorage.getItem('autoRotateFurniture');
            return autoRotateFurniture ? JSON.parse(autoRotateFurniture) : this.AUTO_ROTATE_FURNITURE;
        }
        catch 
        {
            return this.AUTO_ROTATE_FURNITURE;
        }
    }

    /**
     * Obtém o número de rotações para a esquerda
     * @returns O número de rotações para a esquerda
     */
    public static getAutoRotateLeft(): number 
    {
        try 
        {
            const autoRotateLeft = localStorage.getItem('autoRotateLeft');
            return autoRotateLeft ? parseInt(autoRotateLeft) : this.AUTO_ROTATE_LEFT;
        }
        catch 
        {
            return this.AUTO_ROTATE_LEFT;
        }
    }

    /**
     * Obtém o número de rotações para a direita
     * @returns O número de rotações para a direita
     */
    public static getAutoRotateRight(): number 
    {
        try 
        {
            const autoRotateRight = localStorage.getItem('autoRotateRight');
            return autoRotateRight ? parseInt(autoRotateRight) : this.AUTO_ROTATE_RIGHT;
        }
        catch 
        {
            return this.AUTO_ROTATE_RIGHT;
        }
    }

    /**
     * Obtém o número de zooms para aumentar
     * @returns O número de zooms para aumentar
     */
    public static getAutoZoomIn(): number 
    {
        try 
        {
            const autoZoomIn = localStorage.getItem('autoZoomIn');
            return autoZoomIn ? parseInt(autoZoomIn) : this.AUTO_ZOOM_IN;
        }
        catch 
        {
            return this.AUTO_ZOOM_IN;
        }
    }

    /**
     * Obtém o número de zooms para diminuir
     * @returns O número de zooms para diminuir
     */
    public static getAutoZoomOut(): number 
    {
        try 
        {
            const autoZoomOut = localStorage.getItem('autoZoomOut');
            return autoZoomOut ? parseInt(autoZoomOut) : this.AUTO_ZOOM_OUT;
        }
        catch 
        {
            return this.AUTO_ZOOM_OUT;
        }
    }
}
