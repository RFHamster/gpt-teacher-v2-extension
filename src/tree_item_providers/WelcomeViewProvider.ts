import * as vscode from 'vscode';

export class WelcomeViewProvider implements vscode.TreeDataProvider<WelcomeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WelcomeItem | undefined | null | void> = new vscode.EventEmitter<WelcomeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WelcomeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: WelcomeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: WelcomeItem): Thenable<WelcomeItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new WelcomeItem(
                'Bem-vindo ao GPT Teacher!',
                'Faça login para começar',
                vscode.TreeItemCollapsibleState.None
            )
        ]);
    }
}

class WelcomeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.description = 'Clique para fazer login';
        this.iconPath = new vscode.ThemeIcon('account');
        this.command = {
            command: 'gpt-teacher.login',
            title: 'Login',
            arguments: []
        };
    }
}
