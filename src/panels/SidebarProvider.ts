import * as vscode from 'vscode';
import { StorageService } from '../services/StorageService';
import { mockItemsByCategory } from '../models/ItemData';

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _storageService: StorageService
    ) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

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

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>GPT Teacher</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 16px;
            line-height: 1.6;
        }

        .container {
            max-width: 100%;
        }

        /* Welcome Screen */
        .welcome-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
        }

        .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .welcome-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-textLink-foreground);
        }

        .welcome-subtitle {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 24px;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .username {
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
        }

        .items-count {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        /* Button */
        .btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-family: var(--vscode-font-family);
            transition: background-color 0.2s;
        }

        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        /* Category Group */
        .category-group {
            margin-bottom: 16px;
        }

        .category-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background-color: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 8px;
        }

        .category-header:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .category-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .category-count {
            font-size: 11px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: 8px;
        }

        .category-arrow {
            font-size: 12px;
            transition: transform 0.2s;
        }

        .category-arrow.expanded {
            transform: rotate(90deg);
        }

        .category-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-left: 4px;
        }

        .category-items.collapsed {
            display: none;
        }

        /* Items List */
        .items-list {
            display: flex;
            flex-direction: column;
        }

        .item-card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .item-card:hover {
            background-color: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-textLink-foreground);
        }

        .item-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 8px;
        }

        .item-icon {
            font-size: 20px;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .item-content {
            flex: 1;
        }

        .item-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--vscode-foreground);
        }

        .item-mini-desc {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        .item-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 8px;
        }

        .status-done {
            background-color: rgba(0, 255, 0, 0.2);
            color: var(--vscode-charts-green);
        }

        .status-pending {
            background-color: rgba(255, 255, 0, 0.2);
            color: var(--vscode-charts-yellow);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="container" id="container">
        <!-- Content will be inserted here by JavaScript -->
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        let state = {
            isAuthenticated: false,
            username: null,
            itemsByCategory: {},
            expandedCategories: {}
        };

        // Request initial data
        vscode.postMessage({ type: 'requestData' });

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            if (message.type === 'update') {
                state.isAuthenticated = message.isAuthenticated;
                state.username = message.username;
                state.itemsByCategory = message.itemsByCategory || {};

                // Initialize all categories as expanded by default
                if (!Object.keys(state.expandedCategories).length) {
                    Object.keys(state.itemsByCategory).forEach(category => {
                        state.expandedCategories[category] = true;
                    });
                }

                render();
            }
        });

        function render() {
            const container = document.getElementById('container');

            if (!state.isAuthenticated) {
                container.innerHTML = '';

                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'welcome-screen';
                welcomeDiv.innerHTML = \`
                    <div class="welcome-icon">📚</div>
                    <h1 class="welcome-title">Bem-vindo ao GPT Teacher!</h1>
                    <p class="welcome-subtitle">Faça login para acessar seus itens e começar a aprender.</p>
                    <div style="margin-top: 20px; font-size: 12px; color: var(--vscode-descriptionForeground);">
                        <strong>Dev:</strong> rhuan / rhuan
                    </div>
                \`;

                const loginBtn = document.createElement('button');
                loginBtn.className = 'btn';
                loginBtn.textContent = 'Fazer Login';
                loginBtn.addEventListener('click', login);

                welcomeDiv.insertBefore(loginBtn, welcomeDiv.lastElementChild);
                container.appendChild(welcomeDiv);
            } else {
                container.innerHTML = '';

                // Calculate total items
                const totalItems = Object.values(state.itemsByCategory).reduce((sum, items) => sum + items.length, 0);

                // Create header
                const headerDiv = document.createElement('div');
                headerDiv.className = 'header';
                headerDiv.innerHTML = \`
                    <div class="user-info">
                        <span class="username">👤 \${state.username || 'Usuário'}</span>
                        <span class="items-count">• \${totalItems} itens</span>
                    </div>
                \`;

                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'btn btn-secondary';
                logoutBtn.textContent = 'Sair';
                logoutBtn.addEventListener('click', logout);
                headerDiv.appendChild(logoutBtn);

                container.appendChild(headerDiv);

                // Create items list with categories
                const itemsListDiv = document.createElement('div');
                itemsListDiv.className = 'items-list';

                const categories = Object.keys(state.itemsByCategory);

                if (categories.length === 0) {
                    itemsListDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Nenhum item disponível</p></div>';
                } else {
                    categories.forEach(categoryName => {
                        const items = state.itemsByCategory[categoryName];
                        const isExpanded = state.expandedCategories[categoryName];

                        // Category group container
                        const categoryGroup = document.createElement('div');
                        categoryGroup.className = 'category-group';

                        // Category header
                        const categoryHeader = document.createElement('div');
                        categoryHeader.className = 'category-header';
                        categoryHeader.innerHTML = \`
                            <div class="category-title">
                                <span>\${categoryName}</span>
                                <span class="category-count">\${items.length}</span>
                            </div>
                            <span class="category-arrow \${isExpanded ? 'expanded' : ''}">▶</span>
                        \`;
                        categoryHeader.addEventListener('click', () => toggleCategory(categoryName));

                        categoryGroup.appendChild(categoryHeader);

                        // Category items
                        const categoryItems = document.createElement('div');
                        categoryItems.className = \`category-items \${isExpanded ? '' : 'collapsed'}\`;

                        items.forEach(item => {
                            const itemCard = document.createElement('div');
                            itemCard.className = 'item-card';
                            itemCard.innerHTML = \`
                                <div class="item-header">
                                    <div class="item-icon">\${item.is_done ? '✅' : '⭕'}</div>
                                    <div class="item-content">
                                        <div class="item-title">\${item.title}</div>
                                        <div class="item-mini-desc">\${item.miniDescription || ''}</div>
                                        <span class="item-status \${item.is_done ? 'status-done' : 'status-pending'}">
                                            \${item.is_done ? 'Concluído' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            \`;
                            itemCard.addEventListener('click', () => openItem(item));
                            categoryItems.appendChild(itemCard);
                        });

                        categoryGroup.appendChild(categoryItems);
                        itemsListDiv.appendChild(categoryGroup);
                    });
                }

                container.appendChild(itemsListDiv);
            }
        }

        function toggleCategory(categoryName) {
            state.expandedCategories[categoryName] = !state.expandedCategories[categoryName];
            render();
        }

        function login() {
            vscode.postMessage({ type: 'login' });
        }

        function logout() {
            vscode.postMessage({ type: 'logout' });
        }

        function openItem(item) {
            vscode.postMessage({ type: 'openItem', item });
        }

        // Initial render
        render();
    </script>
</body>
</html>`;
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
