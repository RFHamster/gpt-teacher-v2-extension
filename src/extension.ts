import * as vscode from 'vscode';
import { ItemsProvider, ItemData } from './tree_item_providers/ItemsProvider';
import { ItemWebviewPanel } from './panels/ItemWebviewPanel';
import { StorageService } from './services/StorageService';
import { LoginWebviewPanel } from './panels/LoginWebviewPanel';

export function activate(context: vscode.ExtensionContext) {
	console.log('GPT Teacher extension is now active!');

	// Initialize storage service
	const storageService = new StorageService(context);

	// Set authentication context
	const updateAuthContext = (isAuthenticated: boolean) => {
		vscode.commands.executeCommand('setContext', 'gpt-teacher.authenticated', isAuthenticated);
	};

	// Initialize with current auth state
	updateAuthContext(storageService.isAuthenticated());

	// Items provider (will be shown only when authenticated)
	const itemsProvider = new ItemsProvider();

	// Register the tree view (conditionally shown based on auth context)
	const treeView = vscode.window.createTreeView('gpt-teacher-items', {
		treeDataProvider: itemsProvider,
		showCollapseAll: false
	});

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('gpt-teacher.refreshItems', () => {
		itemsProvider.refresh();
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
			updateAuthContext(false);
			vscode.window.showInformationMessage('Logout realizado com sucesso!');
		}
	});

	// Register login command (for manual login trigger)
	const loginCommand = vscode.commands.registerCommand('gpt-teacher.login', () => {
		const loginPanel = LoginWebviewPanel.createOrShow(context.extensionUri, storageService);

		// When login is successful, update context
		loginPanel.onLoginSuccess(() => {
			updateAuthContext(true);
			vscode.window.showInformationMessage('Bem-vindo ao GPT Teacher!');
			itemsProvider.refresh();
		});
	});

	context.subscriptions.push(treeView);
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
