import * as vscode from 'vscode';
import { ItemData } from '../models/ItemData';

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
        const statusLabel = itemData.is_done ? 'Concluído' : 'Pendente';
        const statusClass = itemData.is_done ? 'status-done' : 'status-pending';

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itemData.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 32px 40px;
            line-height: 1.6;
            max-width: 780px;
        }

        .header {
            margin-bottom: 28px;
        }

        .badge-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .status-badge {
            font-size: 11px;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 20px;
        }

        .status-done {
            background-color: rgba(0, 200, 100, 0.15);
            color: var(--vscode-charts-green);
        }

        .status-pending {
            background-color: rgba(255, 200, 0, 0.15);
            color: var(--vscode-charts-yellow);
        }

        h1 {
            font-size: 1.6em;
            font-weight: 700;
            color: var(--vscode-editor-foreground);
            margin-bottom: 6px;
            line-height: 1.3;
        }

        .mini-desc {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        .divider {
            border: none;
            border-top: 1px solid var(--vscode-panel-border);
            margin: 24px 0;
        }

        .section-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 12px;
        }

        .problem-box {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 3px solid var(--vscode-textLink-foreground);
            border-radius: 0 6px 6px 0;
            padding: 16px 20px;
            font-size: 14px;
            line-height: 1.75;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="badge-row">
            <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <h1>${itemData.title}</h1>
        <p class="mini-desc">${itemData.miniDescription || ''}</p>
    </div>

    <hr class="divider">

    <p class="section-label">Problema</p>
    <div class="problem-box">
        <p>${itemData.description}</p>
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
