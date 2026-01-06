import * as vscode from 'vscode';
import { ItemData } from '../models/ItemData';
import { ItemWebviewPanel } from '../panels/ItemWebviewPanel';
import { SidebarProvider } from '../panels/SidebarProvider';

interface ItemCommandDependencies {
    sidebarProvider: SidebarProvider;
    extensionUri: vscode.Uri;
}

export function registerItemCommands(
    context: vscode.ExtensionContext,
    deps: ItemCommandDependencies
): void {
    const { sidebarProvider, extensionUri } = deps;

    // Refresh items command
    const refreshCommand = vscode.commands.registerCommand(
        'gpt-teacher.refreshItems',
        () => {
            sidebarProvider.sendItemsToWebview();
            vscode.window.showInformationMessage('Items refreshed!');
        }
    );

    // Open item command
    const openItemCommand = vscode.commands.registerCommand(
        'gpt-teacher.openItem',
        (itemData: ItemData) => {
            ItemWebviewPanel.createOrShow(extensionUri, itemData);
        }
    );

    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(openItemCommand);
}
