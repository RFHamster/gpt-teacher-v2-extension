import * as vscode from 'vscode';
import { SidebarProvider } from '../panels/SidebarProvider';
import { ChatService } from '../services/ChatService';
import { ChatCacheService } from '../services/ChatCacheService';
import { ItemWebviewPanel } from '../panels/ItemWebviewPanel';
import { mockItemsByCategory } from '../models/ItemData';
import { ChatMessage } from '../models/ChatData';

interface ChatCommandDependencies {
    sidebarProvider: SidebarProvider;
    chatService: ChatService;
    chatCacheService: ChatCacheService;
    extensionUri: vscode.Uri;
}

export function registerChatCommands(
    context: vscode.ExtensionContext,
    deps: ChatCommandDependencies
): void {
    const { sidebarProvider, chatService, chatCacheService, extensionUri } = deps;

    // Open chat command
    const openChatCommand = vscode.commands.registerCommand(
        'gpt-teacher.openChat',
        async (itemId: string) => {
            console.log('[chatCommands] openChat called with itemId:', itemId);

            // Find item title from mock data
            let itemTitle = `Item ${itemId}`;
            for (const category in mockItemsByCategory) {
                const item = mockItemsByCategory[category].find(i => i.id === itemId);
                if (item) {
                    itemTitle = item.title;
                    break;
                }
            }
            console.log('[chatCommands] Item title:', itemTitle);

            // Get or create session from cache
            let cachedData = chatCacheService.getChatData(itemId);
            console.log('[chatCommands] Cached data:', cachedData);

            if (!cachedData) {
                console.log('[chatCommands] No cached data, creating new session');

                // Create new session
                const session = chatService.getSession(itemId);
                session.itemTitle = itemTitle;

                // Get initial messages from API (mocked)
                const messages = chatService.getMessages(session.sessionId);

                console.log('[chatCommands] Saving to cache:', { session, messages });

                // Save to cache
                await chatCacheService.saveChatData(itemId, { session, messages });
            }

            // Open chat in sidebar
            console.log('[chatCommands] Opening chat in sidebar');
            sidebarProvider.openChat(itemId);
        }
    );

    // Close chat command
    const closeChatCommand = vscode.commands.registerCommand(
        'gpt-teacher.closeChat',
        async () => {
            console.log('[chatCommands] closeChat called');

            // Clear all chat cache
            await chatCacheService.clearChat();

            // Close chat in sidebar
            sidebarProvider.closeChat();
        }
    );

    // Send chat message command
    const sendChatMessageCommand = vscode.commands.registerCommand(
        'gpt-teacher.sendChatMessage',
        async (sessionId: string, itemId: string, content: string) => {
            console.log('[chatCommands] sendChatMessage called:', { sessionId, itemId, content });

            // Add user message to cache
            const userMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                content: content,
                sender: 'user',
                timestamp: new Date().toISOString()
            };

            console.log('[chatCommands] Adding user message to cache:', userMessage);
            await chatCacheService.addMessage(itemId, userMessage);

            // Send user message to webview immediately
            console.log('[chatCommands] Sending user message to webview');
            sidebarProvider.sendChatMessage(userMessage);

            // Send to API and get assistant response (mocked)
            console.log('[chatCommands] Sending message to API...');
            const assistantMessage = await chatService.sendMessage(sessionId, content);

            // Add assistant message to cache
            console.log('[chatCommands] Adding assistant message to cache:', assistantMessage);
            await chatCacheService.addMessage(itemId, assistantMessage);

            // Send assistant message to webview
            console.log('[chatCommands] Sending assistant message to webview');
            sidebarProvider.sendChatMessage(assistantMessage);
        }
    );

    // Open item from chat command
    const openItemFromChatCommand = vscode.commands.registerCommand(
        'gpt-teacher.openItemFromChat',
        (itemId: string) => {
            // Find item data
            for (const category in mockItemsByCategory) {
                const item = mockItemsByCategory[category].find(i => i.id === itemId);
                if (item) {
                    ItemWebviewPanel.createOrShow(extensionUri, item);
                    break;
                }
            }
        }
    );

    context.subscriptions.push(openChatCommand);
    context.subscriptions.push(closeChatCommand);
    context.subscriptions.push(sendChatMessageCommand);
    context.subscriptions.push(openItemFromChatCommand);
}
