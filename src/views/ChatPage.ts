import * as vscode from 'vscode';
import { BasePage } from './BasePage';
import { StorageService } from '../services/StorageService';
import { ChatCacheService } from '../services/ChatCacheService';
import { ChatSessionMetadata, ChatMessage, ChatCacheData } from '../models/ChatData';

export class ChatPage extends BasePage {
    private pageName = 'chat';
    private chatCacheService: ChatCacheService;

    constructor(
        extensionUri: any,
        private storageService: StorageService,
        context: vscode.ExtensionContext,
        private currentItemId?: string
    ) {
        super(extensionUri);
        this.chatCacheService = new ChatCacheService(context);
    }

    getPageName(): string {
        return this.pageName;
    }

    private getData(): ChatCacheData {
        if (!this.currentItemId) {
            throw new Error('No item ID provided for chat session');
        }

        console.log('[ChatPage] getData called for itemId:', this.currentItemId);

        // Get data from cache
        const cachedData = this.chatCacheService.getChatData(this.currentItemId);

        if (cachedData) {
            console.log('[ChatPage] Returning cached data:', cachedData);
            return cachedData;
        }

        // Fallback: return empty data if no cache found
        console.warn('[ChatPage] No cached data found, returning empty data');
        const session: ChatSessionMetadata = {
            sessionId: `session-${this.currentItemId}`,
            itemId: this.currentItemId,
            itemTitle: `Item ${this.currentItemId}`,
            startedAt: new Date().toISOString(),
            status: 'active'
        };

        const messages: ChatMessage[] = [];

        return {
            session,
            messages
        };
    }

    private renderMessage(message: ChatMessage): string {
        const isUser = message.sender === 'user';
        const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="message ${isUser ? 'message-user' : 'message-assistant'}">
                <div class="message-header">
                    <span class="message-sender">${isUser ? 'Você' : 'Assistente'}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-content">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    }

    private renderMessages(messages: ChatMessage[]): string {
        if (messages.length === 0) {
            return `
                <div class="empty-chat">
                    <div class="empty-chat-icon">💬</div>
                    <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
            `;
        }

        return messages.map(msg => this.renderMessage(msg)).join('');
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    render(): string {
        const data = this.getData();
        const { session, messages } = data;

        const messagesHtml = this.renderMessages(messages);
        const sessionData = this.escapeHtml(JSON.stringify(session));

        return `
            <div class="chat-container" data-session='${sessionData}'>
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-title">${this.escapeHtml(session.itemTitle)}</div>
                        <div class="chat-status">
                            <span class="status-indicator ${session.status === 'active' ? 'status-active' : 'status-ended'}"></span>
                            <span class="status-text">${session.status === 'active' ? 'Ativo' : 'Encerrado'}</span>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button class="btn btn-secondary" id="openItemBtn" title="Abrir descrição do item">
                            📄 Abrir Descrição
                        </button>
                        <button class="btn btn-danger" id="closeChatBtn" title="Sair do chat">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages">
                    ${messagesHtml}
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea
                            id="chatInput"
                            class="chat-input"
                            placeholder="Digite sua mensagem..."
                            rows="1"
                        ></textarea>
                        <button class="btn btn-primary" id="sendMessageBtn" title="Enviar mensagem">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
