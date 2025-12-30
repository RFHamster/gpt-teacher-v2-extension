import { ItemsByCategory, mockItemsByCategory } from '../models/ItemData';

interface ExpandedCategoriesState {
    [categoryName: string]: boolean;
}

export class ItemDashboardService {
    /**
     * Retorna os itens por categoria
     * TODO: Substituir por chamada HTTP quando implementado
     */
    public getItemsByCategory(): ItemsByCategory {
        return mockItemsByCategory;
    }

    /**
     * Retorna o estado de expansão das categorias
     * Por padrão, todas as categorias começam expandidas
     */
    public getExpandedCategories(itemsByCategory?: ItemsByCategory): ExpandedCategoriesState {
        const items = itemsByCategory || this.getItemsByCategory();
        const expandedState: ExpandedCategoriesState = {};

        // Inicializa todas as categorias como expandidas
        Object.keys(items).forEach(category => {
            expandedState[category] = true;
        });

        return expandedState;
    }
}
