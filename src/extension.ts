import * as vscode from 'vscode';
import { ItemData } from './tree_item_providers/ItemsProvider';
import { ItemWebviewPanel } from './panels/ItemWebviewPanel';
import { StorageService } from './services/StorageService';
import { LoginWebviewPanel } from './panels/LoginWebviewPanel';
import { SidebarProvider } from './panels/SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('GPT Teacher extension is now active!');

	// Initialize storage service
	const storageService = new StorageService(context);

	// Create sidebar provider
	const sidebarProvider = new SidebarProvider(context.extensionUri, storageService);

	// Register the webview view provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('gpt-teacher-sidebar-view', sidebarProvider)
	);

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('gpt-teacher.refreshItems', () => {
		sidebarProvider.sendItemsToWebview();
		vscode.window.showInformationMessage('Items refreshed!');
	});

	// Register open item command
	const openItemCommand = vscode.commands.registerCommand('gpt-teacher.openItem', (itemData: ItemData) => {
		ItemWebviewPanel.createOrShow(context.extensionUri, itemData);
	});

	// Register logout command
	const logoutCommand = vscode.commands.registerCommand('gpt-teacher.logout', async () => {
		const confirm = await vscode.window.showWarningMessage(
			'Tem certeza que deseja sair?',
			'Sim',
			'Não'
		);

		if (confirm === 'Sim') {
			await storageService.logout();
			sidebarProvider.sendItemsToWebview();
			vscode.window.showInformationMessage('Logout realizado com sucesso!');
		}
	});

	// Register login command (for manual login trigger)
	const loginCommand = vscode.commands.registerCommand('gpt-teacher.login', () => {
		const loginPanel = LoginWebviewPanel.createOrShow(context.extensionUri, storageService);

		// When login is successful, update sidebar
		loginPanel.onLoginSuccess(() => {
			vscode.window.showInformationMessage('Bem-vindo ao GPT Teacher!');
			sidebarProvider.sendItemsToWebview();
		});
	});

	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(openItemCommand);
	context.subscriptions.push(logoutCommand);
	context.subscriptions.push(loginCommand);

	// Show welcome message if already authenticated
	if (storageService.isAuthenticated()) {
		const userMetadata = storageService.getUserMetadata();
		if (userMetadata) {
			vscode.window.showInformationMessage(`Bem-vindo de volta, ${userMetadata.username}!`);
		}
	}
}

export function deactivate() {}
