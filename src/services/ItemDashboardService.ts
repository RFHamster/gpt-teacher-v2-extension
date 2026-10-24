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

interface ExerciseListPublic {
    id: string;
    classroom_id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    created_at: string;
}

interface ProblemPublic {
    id: string;
    title: string;
    description: string;
    category: string | null;
    classroom_id: string;
    list_id: string | null;
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
                const lists = await this.fetchLists(classroom.id, token);
                if (lists.length === 0) {
                    continue;
                }
                const allProblems = await this.fetchProblems(classroom.id, token);

                for (const list of lists) {
                    const listProblems = allProblems.filter(
                        p => p.list_id === list.id && !p.is_sandbox
                    );
                    const items = listProblems.map(p => this.mapProblemToItem(p));
                    const key = `${classroom.id}__${list.id}`;
                    result[key] = {
                        title: `${classroom.name} › ${list.name}`,
                        items,
                        pending_items: items.length,
                    };
                }
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

    public async getProblemInfo(itemId: string): Promise<ProblemInfo | undefined> {
        const problem = await this.fetchProblemById(itemId);
        if (!problem) {
            return undefined;
        }
        return {
            id: problem.id,
            title: problem.title,
            description: problem.description,
        };
    }

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
            is_done: false,
        };
    }

    private mapProblemToItem(p: ProblemPublic): ItemData {
        return {
            id: p.id,
            title: p.title,
            description: p.description,
            miniDescription: p.category || undefined,
            is_done: false,
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

    private async fetchLists(classroomId: string, token: string): Promise<ExerciseListPublic[]> {
        try {
            const response = await fetch(
                `${config.BACKEND_URL}/api/v1/classrooms/${classroomId}/lists`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!response.ok) {
                console.warn(`[ItemDashboardService] Sem listas para turma ${classroomId}: ${response.status}`);
                return [];
            }

            return await response.json() as ExerciseListPublic[];
        } catch (error) {
            console.warn('[ItemDashboardService] Erro ao buscar listas:', error);
            return [];
        }
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
}
