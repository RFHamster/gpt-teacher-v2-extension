import { BasePage } from './BasePage';
import { ItemsByCategory } from '../models/ItemData';

export class HomePage extends BasePage {
    render(data: { username: string; itemsByCategory: ItemsByCategory }): string {
        const { username, itemsByCategory } = data;
        const totalItems = Object.values(itemsByCategory).reduce((sum, items) => sum + items.length, 0);

        const categoriesHtml = Object.entries(itemsByCategory).map(([categoryName, items]) => {
            const itemsHtml = items.map(item => `
                <div class="item-card" onclick='handleOpenItem(${JSON.stringify(item)})'>
                    <div class="item-header">
                        <div class="item-icon">${item.is_done ? '✅' : '⭕'}</div>
                        <div class="item-content">
                            <div class="item-title">${item.title}</div>
                            <div class="item-mini-desc">${item.miniDescription || ''}</div>
                            <span class="item-status ${item.is_done ? 'status-done' : 'status-pending'}">
                                ${item.is_done ? 'Concluído' : 'Pendente'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');

            return `
                <div class="category-group">
                    <div class="category-header" onclick="handleToggleCategory('${categoryName}')">
                        <div class="category-title">
                            <span>${categoryName}</span>
                            <span class="category-count">${items.length}</span>
                        </div>
                        <span class="category-arrow expanded" id="arrow-${categoryName}">▶</span>
                    </div>
                    <div class="category-items" id="items-${categoryName}">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="header">
                <div class="user-info">
                    <span class="username">👤 ${username || 'Usuário'}</span>
                    <span class="items-count">• ${totalItems} itens</span>
                </div>
                <button class="btn btn-secondary" onclick="handleLogout()">Sair</button>
            </div>

            <div class="items-list">
                ${categoriesHtml || '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Nenhum item disponível</p></div>'}
            </div>
        `;
    }
}
