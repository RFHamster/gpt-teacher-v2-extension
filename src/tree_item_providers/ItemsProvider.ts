import * as vscode from 'vscode';

export interface ItemData {
    id: string;
    title: string;
    description: string;
    miniDescription?: string;
    is_done: boolean;
}

export class ItemTreeItem extends vscode.TreeItem {
    constructor(
        public readonly itemData: ItemData,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly isHeader: boolean = false
    ) {
        // Use label object to add line breaks
        const labelText = itemData.miniDescription
            ? `${itemData.title}\n   ${itemData.miniDescription}`
            : itemData.title;

        super(labelText, collapsibleState);
        this.tooltip = itemData.description;

        if (!isHeader) {
            this.contextValue = 'item';
            this.command = {
                command: 'gpt-teacher.openItem',
                title: 'Open Item',
                arguments: [this.itemData]
            };

            // Set icon based on done status
            if (itemData.is_done) {
                this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
            } else {
                this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.yellow'));
            }
        } else {
            this.contextValue = 'header';
            this.iconPath = new vscode.ThemeIcon('info');
            this.description = `${this.itemData.description}`;
        }
    }
}

class HeaderItem extends vscode.TreeItem {
    constructor(label: string, description: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon('book');
        this.contextValue = 'header';
    }
}

export class ItemsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private items: ItemData[] = [
        {
            id: '1',
            title: 'Introdução ao TypeScript',
            description: 'Esta é a descrição completa do Item 1. Aqui você vai aprender os fundamentos do TypeScript.',
            miniDescription: 'Aprenda os fundamentos',
            is_done: true
        },
        {
            id: '2',
            title: 'Criando Extensões VSCode',
            description: 'Esta é a descrição completa do Item 2. Neste módulo você vai aprender a criar extensões para o Visual Studio Code.',
            miniDescription: 'Em progresso...',
            is_done: false
        },
        {
            id: '3',
            title: 'APIs e Integração',
            description: 'Esta é a descrição completa do Item 3. Aprenda a integrar sua extensão com APIs externas.',
            miniDescription: 'Não iniciado',
            is_done: false
        }
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const header = new HeaderItem(
                '📚 Aqui estão os seus itens',
                `${this.items.length} itens disponíveis`
            );

            const itemNodes = this.items.map(
                item => new ItemTreeItem(item, vscode.TreeItemCollapsibleState.None)
            );

            return Promise.resolve([header, ...itemNodes]);
        }
    }

    getItems(): ItemData[] {
        return this.items;
    }
}
