import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { LoginWebviewPanel } from '../panels/LoginWebviewPanel';
import { SidebarProvider } from '../panels/SidebarProvider';

interface AuthCommandDependencies {
    storageService: StorageService;
    sidebarProvider: SidebarProvider;
    extensionUri: vscode.Uri;
}

export function registerAuthCommands(
    context: vscode.ExtensionContext,
    deps: AuthCommandDependencies
): void {
    const { storageService, sidebarProvider, extensionUri } = deps;

    // Login command
    const loginCommand = vscode.commands.registerCommand(
        'gpt-teacher.login',
        () => {
            const loginPanel = LoginWebviewPanel.createOrShow(extensionUri, storageService);

            
            loginPanel.onLoginSuccess(async () => {
                vscode.window.showInformationMessage('Bem-vindo ao GPT Teacher!');
                sidebarProvider.updateSidebarWebViewHtml();
                await sidebarProvider.sendItemsToWebview();
            });
        }
    );

    // Logout command
    const logoutCommand = vscode.commands.registerCommand(
        'gpt-teacher.logout',
        async () => {
            const confirm = await vscode.window.showWarningMessage(
                'Tem certeza que deseja sair?',
                'Sim',
                'Não'
            );

            if (confirm === 'Sim') {
                await storageService.logout();
               
                sidebarProvider.updateSidebarWebViewHtml();
                await sidebarProvider.sendItemsToWebview();
                vscode.window.showInformationMessage('Logout realizado com sucesso!');
            }
        }
    );

    context.subscriptions.push(loginCommand);
    context.subscriptions.push(logoutCommand);
}