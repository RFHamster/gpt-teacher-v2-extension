import * as vscode from 'vscode';
import { ChatSessionMetadata, ChatMessage } from '../models/ChatData';

export class ChatService {
    /**
     * Get or create a chat session for an item
     * TODO: Replace with actual API call
     */
    public getSession(itemId: string): ChatSessionMetadata {
        console.log('[ChatService] getSession called for itemId:', itemId);

        // Mock session data (will come from API in the future)
        const session = {
            sessionId: `session-${itemId}`,
            itemId: itemId,
            itemTitle: `Item ${itemId}`, // Will be set from item data
            startedAt: new Date().toISOString(),
            status: 'active' as const
        };

        console.log('[ChatService] Returning session:', session);
        return session;
    }

    /**
     * Get initial messages for a session
     * TODO: Replace with actual API call
     */
    public getMessages(sessionId: string): ChatMessage[] {
        console.log('[ChatService] getMessages called for sessionId:', sessionId);

        // Mock initial messages (will come from API in the future)
        const messages = [
            {
                id: 'msg-welcome',
                content: 'Olá! Como posso ajudar você com este item?',
                sender: 'assistant' as const,
                timestamp: new Date().toISOString()
            }
        ];

        console.log('[ChatService] Returning messages:', messages);
        return messages;
    }

    /**
     * Send a message in a session (mocked - returns assistant response)
     * TODO: Replace with actual API call
     */
    public async sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
        console.log('[ChatService] sendMessage called with:', { sessionId, content });

        // Get current code from active editor
        const currentCode = this.getCurrentEditorCode();
        console.log('[ChatService] Current editor code:', currentCode);

        // Simulate API delay
        await this.delay(500);

        // Mock assistant response (will come from API in the future)
        const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}-assistant`,
            content: this.generateMockResponse(content),
            sender: 'assistant',
            timestamp: new Date().toISOString()
        };

        console.log('[ChatService] Returning assistant message:', assistantMessage);
        return assistantMessage;
    }

    /**
     * Close a chat session
     * TODO: Replace with actual API call
     */
    public async closeSession(sessionId: string): Promise<void> {
        // Simulate API delay
        await this.delay(100);

        // In the future, this will call API to end the session
        console.log(`Session ${sessionId} closed`);
    }

    /**
     * Generate a mock assistant response based on user input
     */
    private generateMockResponse(userMessage: string): string {
        const responses = [
            'Entendi sua dúvida! Vou te explicar melhor sobre isso.',
            'Boa pergunta! Deixa eu te ajudar com isso.',
            'Claro! Aqui está uma explicação detalhada...',
            'Isso é um ponto importante. Vamos por partes:',
            'Perfeito! Vou te mostrar como fazer isso passo a passo.',
        ];

        // Simple response selection based on message length
        const index = userMessage.length % responses.length;
        return responses[index];
    }

    /**
     * Get code from currently active editor in VSCode
     * Returns selected text if there's a selection, otherwise returns full document
     */
    private getCurrentEditorCode(): { code: string; fileName: string; selection: boolean } | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            console.log('[ChatService] No active editor found');
            return null;
        }

        const document = editor.document;
        const selection = editor.selection;

        // Check if there's a selection
        if (!selection.isEmpty) {
            const selectedText = document.getText(selection);
            return {
                code: selectedText,
                fileName: document.fileName,
                selection: true
            };
        }

        // Return full document if no selection
        const fullText = document.getText();
        return {
            code: fullText,
            fileName: document.fileName,
            selection: false
        };
    }

    /**
     * Utility function to simulate async delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
