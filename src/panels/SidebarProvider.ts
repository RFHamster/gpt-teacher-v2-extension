import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { mockItemsByCategory } from '../models/ItemData';
import { RouteService } from '../services/RouteService';

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;
    private readonly _routeService: RouteService;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _storageService: StorageService,
        private readonly _context: vscode.ExtensionContext
    ) {
        this._routeService = new RouteService(_storageService);
    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this.updateSidebarWebViewHtml();


        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {

            switch (data.type) {
                case 'openItem': {
                    vscode.commands.executeCommand('gpt-teacher.openItem', data.item);
                    break;
                }
                case 'openChat': {
                    vscode.commands.executeCommand('gpt-teacher.openChat', data.itemId);
                    break;
                }
                case 'closeChat': {
                    vscode.commands.executeCommand('gpt-teacher.closeChat');
                    break;
                }
                case 'sendChatMessage': {
                    vscode.commands.executeCommand('gpt-teacher.sendChatMessage', data.sessionId, data.itemId, data.content);
                    break;
                }
                case 'openItemFromChat': {
                    vscode.commands.executeCommand('gpt-teacher.openItemFromChat', data.itemId);
                    break;
                }
                case 'login': {
                    vscode.commands.executeCommand('gpt-teacher.login');
                    break;
                }
                case 'logout': {
                    vscode.commands.executeCommand('gpt-teacher.logout');
                    break;
                }
            }
        });
    }

    public sendItemsToWebview() {
        if (this._view) {
            const isAuthenticated = this._storageService.isAuthenticated();
            const userMetadata = this._storageService.getUserMetadata();

            this._view.webview.postMessage({
                type: 'update',
                isAuthenticated,
                username: userMetadata?.username,
                itemsByCategory: mockItemsByCategory
            });
        }
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    public updateSidebarWebViewHtml() {
        if (!this._view) {
            return;
        }

        const context = {
            extensionUri: this._extensionUri,
            storageService: this._storageService,
            context: this._context,
            webview: this._view.webview,
        };

        this._view.webview.html = this._routeService.render(context);
    }

    public openChat(itemId: string) {
        console.log('[SidebarProvider] openChat called with itemId:', itemId);
        this._routeService.openChat(itemId);
        this.updateSidebarWebViewHtml();
    }

    public closeChat() {
        console.log('[SidebarProvider] closeChat called');
        this._routeService.closeChat();
        this.updateSidebarWebViewHtml();
    }

    public sendChatMessage(message: any) {
        // Optionally send message to webview to update UI
        if (this._view) {
            this._view.webview.postMessage({
                type: 'chatMessageReceived',
                message: message
            });
        }
    }
}
