import * as vscode from 'vscode';
import { ChatMessage, ChatSessionMetadata, ChatCacheData } from '../models/ChatData';

/**
 * Service to cache chat sessions and messages in VSCode's globalState
 * Similar to browser's localStorage
 * Uses a single global cache key that gets cleared when chat is closed
 */
export class ChatCacheService {
    private static readonly CACHE_KEY = 'gpt-teacher.chat.current';

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Get cached chat data for an item
     */
    public getChatData(itemId: string): ChatCacheData | undefined {
        const data = this.context.globalState.get<ChatCacheData>(ChatCacheService.CACHE_KEY);
        console.log('[ChatCacheService] getChatData for itemId:', itemId, 'data:', data);

        // Verify it's for the correct item
        if (data && data.session.itemId === itemId) {
            return data;
        }

        return undefined;
    }

    /**
     * Save chat data to cache (overwrites any existing cache)
     */
    public async saveChatData(itemId: string, data: ChatCacheData): Promise<void> {
        console.log('[ChatCacheService] saveChatData for itemId:', itemId, 'data:', data);
        await this.context.globalState.update(ChatCacheService.CACHE_KEY, data);
        console.log('[ChatCacheService] Data saved successfully');
    }

    /**
     * Get cached messages for an item
     */
    public getMessages(itemId: string): ChatMessage[] {
        const chatData = this.getChatData(itemId);
        const messages = chatData?.messages || [];
        console.log('[ChatCacheService] getMessages for itemId:', itemId, 'messages:', messages);
        return messages;
    }

    /**
     * Save messages to cache
     */
    public async saveMessages(itemId: string, messages: ChatMessage[]): Promise<void> {
        console.log('[ChatCacheService] saveMessages for itemId:', itemId, 'messages:', messages);
        const chatData = this.getChatData(itemId);
        if (chatData) {
            chatData.messages = messages;
            await this.saveChatData(itemId, chatData);
        } else {
            console.warn('[ChatCacheService] No chat data found for itemId:', itemId);
        }
    }

    /**
     * Add a single message to cache
     */
    public async addMessage(itemId: string, message: ChatMessage): Promise<void> {
        console.log('[ChatCacheService] addMessage for itemId:', itemId, 'message:', message);
        const messages = this.getMessages(itemId);
        messages.push(message);
        await this.saveMessages(itemId, messages);
    }

    /**
     * Get cached session for an item
     */
    public getSession(itemId: string): ChatSessionMetadata | undefined {
        const chatData = this.getChatData(itemId);
        return chatData?.session;
    }

    /**
     * Save session to cache
     */
    public async saveSession(itemId: string, session: ChatSessionMetadata): Promise<void> {
        const chatData = this.getChatData(itemId) || { session, messages: [] };
        chatData.session = session;
        await this.saveChatData(itemId, chatData);
    }

    /**
     * Clear chat cache completely
     */
    public async clearChat(): Promise<void> {
        console.log('[ChatCacheService] Clearing all chat cache');
        await this.context.globalState.update(ChatCacheService.CACHE_KEY, undefined);
        console.log('[ChatCacheService] Chat cache cleared');
    }
}
