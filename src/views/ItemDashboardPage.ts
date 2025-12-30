import * as vscode from 'vscode';
import { BasePage } from './BasePage';
import { ItemData, ItemsByCategory } from '../models/ItemData';
import { StorageService } from '../services/StorageService';
import { ItemDashboardService } from '../services/ItemDashboardService';

interface DashboardData {
    username: string;
    itemsByCategory: ItemsByCategory;
    expandedCategories: { [key: string]: boolean };
}

export class ItemDashboardPage extends BasePage {
    private pageName = 'item_dashboard';
    private dashboardService: ItemDashboardService;

    constructor(
        extensionUri: any,
        private storageService: StorageService
    ) {
        super(extensionUri);
        this.dashboardService = new ItemDashboardService();
    }

    getPageName(): string {
        return this.pageName;
    }

    private getData(): DashboardData {
        const userMetadata = this.storageService.getUserMetadata();
        const username = userMetadata?.username || 'Usuário';

        const itemsByCategory = this.dashboardService.getItemsByCategory();
        const expandedCategories = this.dashboardService.getExpandedCategories(itemsByCategory);

        return {
            username,
            itemsByCategory,
            expandedCategories
        };
    }

    private renderItemCard(item: ItemData): string {
        const itemJson = this.escapeHtml(JSON.stringify(item));

        return `
            <div class="item-card" data-item='${itemJson}'>
                <div class="item-header">
                    <div class="item-icon">${item.is_done ? '✅' : '⭕'}</div>
                    <div class="item-content">
                        <div class="item-title">${this.escapeHtml(item.title)}</div>
                        <div class="item-mini-desc">${this.escapeHtml(item.miniDescription || '')}</div>
                        <span class="item-status ${item.is_done ? 'status-done' : 'status-pending'}">
                            ${item.is_done ? 'Concluído' : 'Pendente'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    private renderCategoryGroup(categoryName: string, items: ItemData[], isExpanded: boolean = true): string {
        const itemsHtml = items.map(item => this.renderItemCard(item)).join('');
        const categoryId = this.escapeHtml(categoryName).replace(/\s+/g, '-');

        return `
            <div class="category-group">
                <div class="category-header" data-category="${this.escapeHtml(categoryName)}">
                    <div class="category-title">
                        <span>${this.escapeHtml(categoryName)}</span>
                        <span class="category-count">${items.length}</span>
                    </div>
                    <span class="category-arrow ${isExpanded ? 'expanded' : ''}" data-arrow="${categoryId}">▶</span>
                </div>
                <div class="category-items ${isExpanded ? '' : 'collapsed'}" data-items="${categoryId}">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    private renderItemsList(itemsByCategory: ItemsByCategory, expandedCategories: { [key: string]: boolean }): string {
        const categories = Object.keys(itemsByCategory);

        if (categories.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Nenhum item disponível</p>
                </div>
            `;
        }

        const categoriesHtml = categories.map(categoryName => {
            const items = itemsByCategory[categoryName];
            const isExpanded = expandedCategories[categoryName] !== false; // default true
            return this.renderCategoryGroup(categoryName, items, isExpanded);
        }).join('');

        return categoriesHtml;
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    render(): string {
        const data = this.getData();

        const { username, itemsByCategory, expandedCategories } = data;

        // Initialize all categories as expanded by default
        Object.keys(itemsByCategory).forEach(category => {
            if (expandedCategories[category] === undefined) {
                expandedCategories[category] = true;
            }
        });

        const totalItems = Object.values(itemsByCategory)
            .reduce((sum, items) => sum + items.length, 0);

        const itemsListHtml = this.renderItemsList(itemsByCategory, expandedCategories);

        return `
            <div class="header">
                <div class="user-info">
                    <span class="username">👤 <span id="usernameText">${this.escapeHtml(username)}</span></span>
                    <span class="items-count">• <span id="itemsCountText">${totalItems}</span> itens</span>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Sair</button>
            </div>
            <div class="items-list" id="itemsList">
                ${itemsListHtml}
            </div>
        `;
    }
}
