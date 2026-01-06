import * as vscode from 'vscode';
import { StorageService } from './services/StorageService';
import { ChatService } from './services/ChatService';
import { ChatCacheService } from './services/ChatCacheService';
import { SidebarProvider } from './panels/SidebarProvider';
import { registerAuthCommands } from './extension_commands/authCommands';
import { registerItemCommands } from './extension_commands/itemCommands';
import { registerChatCommands } from './extension_commands/chatCommands';

export function activate(context: vscode.ExtensionContext) {
	console.log('GPT Teacher extension is now active!');

	// Initialize services
	const storageService = new StorageService(context);
	const chatService = new ChatService();
	const chatCacheService = new ChatCacheService(context);

	// Create sidebar provider
	const sidebarProvider = new SidebarProvider(context.extensionUri, storageService, context);

	// Register the webview view provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('gpt-teacher-sidebar-view', sidebarProvider)
	);

	// Register all commands
	registerAuthCommands(context, {
		storageService,
		sidebarProvider,
		extensionUri: context.extensionUri
	});

	registerItemCommands(context, {
		sidebarProvider,
		extensionUri: context.extensionUri
	});

	registerChatCommands(context, {
		sidebarProvider,
		chatService,
		chatCacheService,
		extensionUri: context.extensionUri
	});

	// Show welcome message if already authenticated
	if (storageService.isAuthenticated()) {
		const userMetadata = storageService.getUserMetadata();
		if (userMetadata) {
			vscode.window.showInformationMessage(`Bem-vindo de volta, ${userMetadata.username}!`);
		}
	}
}

export function deactivate() {}
