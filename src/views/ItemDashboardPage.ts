import * as vscode from 'vscode';
import { BasePage } from './BasePage';
import { ItemData, ItemsByCategory, CategoryData } from '../models/ItemData';
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

    private renderCategoryGroup(categoryId: string, categoryData: CategoryData, isExpanded: boolean = false): string {
        const itemsHtml = categoryData.items.map((item: ItemData) => this.renderItemCard(item)).join('');
        const categoryIdClean = this.escapeHtml(categoryId).replace(/\s+/g, '-');

        // Use pending_items directly from API response (only show if it exists)
        const pendingCountHtml = categoryData.pending_items !== undefined
            ? `<span class="category-count">${categoryData.pending_items} pendente${categoryData.pending_items !== 1 ? 's' : ''}</span>`
            : '';

        return `
            <div class="category-group">
                <div class="category-header" data-category="${this.escapeHtml(categoryId)}">
                    <div class="category-title">
                        <span>${this.escapeHtml(categoryData.title)}</span>
                        ${pendingCountHtml}
                    </div>
                    <span class="category-arrow ${isExpanded ? 'expanded' : ''}" data-arrow="${categoryIdClean}">▶</span>
                </div>
                <div class="category-items ${isExpanded ? '' : 'collapsed'}" data-items="${categoryIdClean}">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    private renderItemsList(itemsByCategory: ItemsByCategory, expandedCategories: { [key: string]: boolean }): string {
        const categoryIds = Object.keys(itemsByCategory);

        if (categoryIds.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Nenhum item disponível</p>
                </div>
            `;
        }

        const categoriesHtml = categoryIds.map(categoryId => {
            const categoryData = itemsByCategory[categoryId];
            const isExpanded = expandedCategories[categoryId] === true; // default false
            return this.renderCategoryGroup(categoryId, categoryData, isExpanded);
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

        // Initialize all categories as collapsed by default
        Object.keys(itemsByCategory).forEach(category => {
            if (expandedCategories[category] === undefined) {
                expandedCategories[category] = false;
            }
        });

        const itemsListHtml = this.renderItemsList(itemsByCategory, expandedCategories);

        return `
            <div class="header">
                <div class="user-info">
                    <span class="username">👤 <span id="usernameText">${this.escapeHtml(username)}</span></span>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Sair</button>
            </div>
            <div class="items-list" id="itemsList">
                ${itemsListHtml}
            </div>
        `;
    }
}
