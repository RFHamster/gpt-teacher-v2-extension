import * as vscode from 'vscode';
import { StorageService } from './StorageService';
import { ChatSessionMetadata, ChatMessage } from '../models/ChatData';
import { config } from '../config';

interface ProblemInfo {
    id: string;
    title: string;
    description: string;
}

interface StudentSessionPublic {
    id: string;
    student_id: string;
    problem_id: string;
    status: 'open' | 'closed';
    started_at: string;
    closed_at: string | null;
}

interface ChatMessagePublic {
    id: string;
    session_id: string;
    problem_id: string;
    type: 'user' | 'ai';
    content: string;
    code: string | null;
    code_review: string | null;
    created_at: string;
}

export class ChatService {
    constructor(private storageService: StorageService) {}

    /**
     * Obtém a sessão ativa do aluno para este problema, ou cria uma nova.
     */
    public async getSession(problem: ProblemInfo): Promise<ChatSessionMetadata> {
        const token = this.getToken();

        const active = await this.fetchActiveSession(token);

        let session: StudentSessionPublic;

        if (active && active.problem_id === problem.id) {
            session = active;
        } else {
            session = await this.createSession(problem.id, token);
        }

        return {
            sessionId: session.id,
            itemId: problem.id,
            itemTitle: problem.title,
            startedAt: session.started_at,
            status: session.status === 'open' ? 'active' : 'ended'
        };
    }

    /**
     * Busca o histórico de mensagens de uma sessão.
     */
    public async getMessages(sessionId: string): Promise<ChatMessage[]> {
        const token = this.getToken();

        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/student-session/${sessionId}/chat-messages`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!response.ok) {
            throw new Error(`Falha ao buscar mensagens: ${response.status}`);
        }

        const messages = await response.json() as ChatMessagePublic[];

        return messages.map(m => this.mapToChatMessage(m));
    }

    /**
     * Envia uma mensagem e retorna a resposta da IA.
     * Precisa do título/descrição do problema, exigidos pelo AgentInput.
     */
    public async sendMessage(
        sessionId: string,
        content: string,
        problem: ProblemInfo
    ): Promise<ChatMessage> {
        const token = this.getToken();
        const editorCode = this.getCurrentEditorCode();

        const body = {
            problem_title: problem.title,
            session_id: sessionId,
            problem_description: problem.description,
            student_code: editorCode?.code || '',
            user_message: content
        };

        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/call-agent/student-session/${sessionId}/chat-messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null) as { detail?: string } | null;
            throw new Error(errorData?.detail || `Falha ao enviar mensagem: ${response.status}`);
        }

        const aiMessage = await response.json() as ChatMessagePublic;

        return this.mapToChatMessage(aiMessage);
    }

    /**
     * Fecha a sessão de chat.
     */
    public async closeSession(sessionId: string): Promise<void> {
        const token = this.getToken();

        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/student-sessions/${sessionId}/close`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!response.ok) {
            console.error(`[ChatService] Falha ao fechar sessão: ${response.status}`);
        }
    }

    private async fetchActiveSession(token: string): Promise<StudentSessionPublic | null> {
        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/student-sessions/active`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data as StudentSessionPublic | null;
    }

    private async createSession(problemId: string, token: string): Promise<StudentSessionPublic> {
        const response = await fetch(
            `${config.BACKEND_URL}/api/v1/student-sessions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ problem_id: problemId })
            }
        );

        if (!response.ok) {
            throw new Error(`Falha ao criar sessão: ${response.status}`);
        }

        return await response.json() as StudentSessionPublic;
    }

    private mapToChatMessage(m: ChatMessagePublic): ChatMessage {
        return {
            id: m.id,
            content: m.content,
            sender: m.type === 'ai' ? 'assistant' : 'user',
            timestamp: m.created_at
        };
    }

    private getToken(): string {
        const token = this.storageService.getToken();
        if (!token) {
            throw new Error('Usuário não autenticado');
        }
        return token;
    }

    private getCurrentEditorCode(): { code: string; fileName: string; selection: boolean } | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            console.log('[ChatService] No active editor found');
            return null;
        }

        const document = editor.document;
        const selection = editor.selection;

        if (!selection.isEmpty) {
            const selectedText = document.getText(selection);
            return {
                code: selectedText,
                fileName: document.fileName,
                selection: true
            };
        }

        const fullText = document.getText();
        return {
            code: fullText,
            fileName: document.fileName,
            selection: false
        };
    }
}