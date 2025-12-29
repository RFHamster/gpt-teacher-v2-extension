import * as vscode from 'vscode';

export interface ItemData {
    id: string;
    title: string;
    description: string;
}

export class ItemTreeItem extends vscode.TreeItem {
    constructor(
        public readonly itemData: ItemData,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(itemData.title, collapsibleState);
        this.tooltip = itemData.description;
        this.contextValue = 'item';
        this.command = {
            command: 'gpt-teacher.openItem',
            title: 'Open Item',
            arguments: [this.itemData]
        };
    }
}

export class ItemsProvider implements vscode.TreeDataProvider<ItemTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ItemTreeItem | undefined | null | void> = new vscode.EventEmitter<ItemTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ItemTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private items: ItemData[] = [
        {
            id: '1',
            title: 'Item 1',
            description: 'Esta é a descrição do Item 1'
        },
        {
            id: '2',
            title: 'Item 2',
            description: 'Esta é a descrição do Item 2'
        },
        {
            id: '3',
            title: 'Item 3',
            description: 'Esta é a descrição do Item 3'
        }
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ItemTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ItemTreeItem): Thenable<ItemTreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(
                this.items.map(item => new ItemTreeItem(item, vscode.TreeItemCollapsibleState.None))
            );
        }
    }

    getItems(): ItemData[] {
        return this.items;
    }
}
