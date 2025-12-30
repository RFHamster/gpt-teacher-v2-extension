import * as fs from 'fs';
import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { mockItemsByCategory } from '../models/ItemData';

type PageType = 'welcome' | 'item_dashboard';

interface PageAssets {
    html: vscode.Uri;
    css: vscode.Uri;
    js: vscode.Uri;
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _storageService: StorageService
    ) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this.updateSidebarWebViewHtml()


        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {

            switch (data.type) {
                case 'openItem': {
                    vscode.commands.executeCommand('gpt-teacher.openItem', data.item);
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
                case 'requestData': {
                    this.sendItemsToWebview();
                    break;
                }
            }
        });

        // Send initial data
        this.sendItemsToWebview();
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

        const isAuthenticated = this._storageService.isAuthenticated();
        if (isAuthenticated) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview, 'item_dashboard');
        } else {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview, 'welcome');
        }

    }


    //Remove from here latter

    private _getPageAssets(page: PageType): PageAssets {
        const basePath = vscode.Uri.joinPath(this._extensionUri, 'src', 'pages', page);

        return {
            html: vscode.Uri.joinPath(basePath, `${page}.html`),
            css: vscode.Uri.joinPath(basePath, `${page}.css`),
            js: vscode.Uri.joinPath(basePath, `${page}.js`),
        };
    }

    private _getHtmlForWebview(webview: vscode.Webview, page: PageType): string {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        );
        const nonce = getNonce();

        var page_assets_url = this._getPageAssets(page);

        const styleMainUri = webview.asWebviewUri(page_assets_url.css);
        const scriptUri = webview.asWebviewUri(page_assets_url.js);
        let html = fs.readFileSync(page_assets_url.html.fsPath, 'utf8');

        // Substitui os placeholders
        html = html
            .replace(/\{\{cspSource\}\}/g, webview.cspSource)
            .replace(/\{\{nonce\}\}/g, nonce)
            .replace(/\{\{styleResetUri\}\}/g, styleResetUri.toString())
            .replace(/\{\{styleVSCodeUri\}\}/g, styleVSCodeUri.toString())
            .replace(/\{\{styleMainUri\}\}/g, styleMainUri.toString())
            .replace(/\{\{scriptUri\}\}/g, scriptUri.toString());

        return html;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
