import { StorageService } from './StorageService';
import { ItemsByCategory, ItemData, CategoryData } from '../models/ItemData';
import { config } from '../config';

interface ExpandedCategoriesState {
    [categoryName: string]: boolean;
}

interface ClassroomPublic {
    id: string;
    name: string;
    teacher_id: string;
}

interface ProblemPublic {
    id: string;
    title: string;
    description: string;
    category: string | null;
    classroom_id: string;
    file_path: string | null;
    is_sandbox: boolean;
    created_by_student_id: string | null;
}

export interface ProblemInfo {
    id: string;
    title: string;
    description: string;
}

export class ItemDashboardService {
    // Cache em memória dos itens já buscados, pra consulta rápida
    // por outros comandos (ex: abrir chat) sem rebuscar da API
    private itemsCache: Map<string, ItemData> = new Map();

    // Último resultado buscado, usado para renderização síncrona
    // (BasePage.render() é síncrono por herança, não dá pra usar
    // await ali - os dados reais chegam logo depois via postMessage)
    private cachedItemsByCategory: ItemsByCategory = {};

    constructor(private storageService: StorageService) {}

    public async getItemsByCategory(): Promise<ItemsByCategory> {
        const token = this.storageService.getToken();
        if (!token) {
            this.cachedItemsByCategory = {};
            return {};
        }

        try {
            const classrooms = await this.fetchClassrooms(token);
            const result: ItemsByCategory = {};

            for (const classroom of classrooms) {
                const problems = await this.fetchProblems(classroom.id, token);
                result[classroom.id] = this.groupProblemsByCategory(
                    classroom.name,
                    problems
                );
            }

            this.cachedItemsByCategory = result;
            return result;
        } catch (error) {
            console.error('[ItemDashboardService] Erro ao buscar itens:', error);
            return this.cachedItemsByCategory;
        }
    }

    /**
     * Retorna o último resultado buscado, de forma síncrona.
     * Usado na renderização inicial do HTML da sidebar, antes do
     * fetch assíncrono de getItemsByCategory() completar.
     */
    public getCachedItemsByCategory(): ItemsByCategory {
        return this.cachedItemsByCategory;
    }

    public getExpandedCategories(itemsByCategory: ItemsByCategory): ExpandedCategoriesState {
        const expandedState: ExpandedCategoriesState = {};

        Object.keys(itemsByCategory).forEach(category => {
            expandedState[category] = false;
        });

        return expandedState;
    }

    /**
     * Retorna dados completos (id/title/description) de um item
     * já buscado anteriormente via getItemsByCategory().
     */
    public getProblemInfo(itemId: string): ProblemInfo | undefined {
        const item = this.itemsCache.get(itemId);
        if (!item) {
            return undefined;
        }
        return {
            id: item.id,
            title: item.title,
            description: item.description
        };
    }

    /**
     * Retorna o ItemData completo (usado pelo ItemWebviewPanel).
     */
    public getItemData(itemId: string): ItemData | undefined {
        return this.itemsCache.get(itemId);
    }

    private async fetchClassrooms(token: string): Promise<ClassroomPublic[]> {
        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/students/me/classrooms`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            throw new Error(`Falha ao buscar turmas: ${response.status}`);
        }

        const data = await response.json() as ClassroomPublic[];
        console.log('[ItemDashboardService] Classrooms recebidas:', JSON.stringify(data));
        return data;
    }

    private async fetchProblems(classroomId: string, token: string): Promise<ProblemPublic[]> {
        console.log('[ItemDashboardService] Buscando problemas para classroomId:', classroomId);

        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/classrooms/${classroomId}/problems`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            console.error('[ItemDashboardService] Resposta de erro do backend:', errorBody);
            throw new Error(`Falha ao buscar problemas: ${response.status}`);
        }

        return await response.json() as ProblemPublic[];
    }

    private groupProblemsByCategory(classroomName: string, problems: ProblemPublic[]): CategoryData {
        const items: ItemData[] = problems.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            miniDescription: p.category || undefined,
            is_done: false
        }));

        // Popula o cache pra consulta posterior (ex: abrir chat)
        items.forEach(item => this.itemsCache.set(item.id, item));

        return {
            title: classroomName,
            items,
            pending_items: items.length
        };
    }
}