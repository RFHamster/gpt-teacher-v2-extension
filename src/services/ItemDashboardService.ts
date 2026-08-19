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
    constructor(private storageService: StorageService) {}

    public async getItemsByCategory(): Promise<ItemsByCategory> {
        const token = this.storageService.getToken();
        if (!token) {
            return {};
        }

        try {
            const classrooms = await this.fetchClassrooms(token);
            const result: ItemsByCategory = {};

            for (const classroom of classrooms) {
                const problems = await this.fetchProblems(classroom.id, token);
                result[classroom.id] = this.mapProblemsToCategory(
                    classroom.name,
                    problems
                );
            }

            return result;
        } catch (error) {
            console.error('[ItemDashboardService] Erro ao buscar itens:', error);
            return {};
        }
    }

    public getExpandedCategories(itemsByCategory: ItemsByCategory): ExpandedCategoriesState {
        const expandedState: ExpandedCategoriesState = {};

        Object.keys(itemsByCategory).forEach(category => {
            expandedState[category] = false;
        });

        return expandedState;
    }

    /**
     * Busca os dados de um problema direto da API (sem cache local).
     */
    public async getProblemInfo(itemId: string): Promise<ProblemInfo | undefined> {
        const problem = await this.fetchProblemById(itemId);
        if (!problem) {
            return undefined;
        }
        return {
            id: problem.id,
            title: problem.title,
            description: problem.description
        };
    }

    /**
     * Busca o ItemData completo de um problema direto da API (sem cache local).
     */
    public async getItemData(itemId: string): Promise<ItemData | undefined> {
        const problem = await this.fetchProblemById(itemId);
        if (!problem) {
            return undefined;
        }
        return {
            id: problem.id,
            title: problem.title,
            description: problem.description,
            miniDescription: problem.category || undefined,
            is_done: false
        };
    }

    private async fetchProblemById(problemId: string): Promise<ProblemPublic | undefined> {
        const token = this.storageService.getToken();
        if (!token) {
            return undefined;
        }

        try {
            const response = await fetch(
                `${config.BACKEND_URL}/api/v1/problems/${problemId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) {
                console.error(`[ItemDashboardService] Falha ao buscar problema ${problemId}: ${response.status}`);
                return undefined;
            }

            return await response.json() as ProblemPublic;
        } catch (error) {
            console.error('[ItemDashboardService] Erro ao buscar problema:', error);
            return undefined;
        }
    }

    private async fetchClassrooms(token: string): Promise<ClassroomPublic[]> {
        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/students/me/classrooms`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            throw new Error(`Falha ao buscar turmas: ${response.status}`);
        }

        return await response.json() as ClassroomPublic[];
    }

    private async fetchProblems(classroomId: string, token: string): Promise<ProblemPublic[]> {
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

    private mapProblemsToCategory(classroomName: string, problems: ProblemPublic[]): CategoryData {
        const items: ItemData[] = problems.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            miniDescription: p.category || undefined,
            is_done: false
        }));

        return {
            title: classroomName,
            items,
            pending_items: items.length
        };
    }
}