import * as vscode from 'vscode';
import { ItemData } from './ItemsProvider';

export class ItemWebviewPanel {
    public static currentPanel: ItemWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, itemData: ItemData) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._update(itemData);
    }

    public static createOrShow(extensionUri: vscode.Uri, itemData: ItemData) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (ItemWebviewPanel.currentPanel) {
            ItemWebviewPanel.currentPanel._panel.reveal(column);
            ItemWebviewPanel.currentPanel._update(itemData);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'itemDetail',
            itemData.title,
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        ItemWebviewPanel.currentPanel = new ItemWebviewPanel(panel, itemData);
    }

    private _update(itemData: ItemData) {
        this._panel.title = itemData.title;
        this._panel.webview.html = this._getHtmlContent(itemData);
    }

    private _getHtmlContent(itemData: ItemData): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itemData.title}</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: var(--vscode-editor-foreground);
            border-bottom: 2px solid var(--vscode-textLink-foreground);
            padding-bottom: 10px;
        }
        .item-id {
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .description {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .section {
            margin-top: 30px;
        }
        .section h2 {
            color: var(--vscode-textLink-foreground);
            font-size: 1.2em;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>${itemData.title}</h1>
    <div class="item-id">ID: ${itemData.id}</div>

    <div class="description">
        <h2>Descrição</h2>
        <p>${itemData.description}</p>
    </div>

    <div class="section">
        <h2>Conteúdo Adicional</h2>
        <p>Aqui você pode adicionar mais informações sobre este item.</p>
        <p>Este é um exemplo de página de detalhes que pode ser customizada conforme sua necessidade.</p>
    </div>

    <div class="section">
        <h2>Recursos</h2>
        <ul>
            <li>Recurso 1 do ${itemData.title}</li>
            <li>Recurso 2 do ${itemData.title}</li>
            <li>Recurso 3 do ${itemData.title}</li>
        </ul>
    </div>
</body>
</html>`;
    }

    public dispose() {
        ItemWebviewPanel.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
