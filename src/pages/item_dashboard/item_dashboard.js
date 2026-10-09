// Item Dashboard - Event Handlers
(function() {
    const vscode = acquireVsCodeApi();

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return (text || '').replace(/[&<>"']/g, (m) => map[m]);
    }

    function renderItemCard(item) {
        const itemJson = escapeHtml(JSON.stringify(item));
        return `
            <div class="item-card" data-item='${itemJson}'>
                <div class="item-header">
                    <div class="item-content">
                        <div class="item-title">${escapeHtml(item.title)}</div>
                        <div class="item-mini-desc">${escapeHtml(item.miniDescription || '')}</div>
                        <span class="item-status ${item.is_done ? 'status-done' : 'status-pending'}">
                            ${item.is_done ? 'Concluído' : 'Pendente'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCategoryGroup(categoryId, categoryData, isExpanded) {
        const itemsHtml = categoryData.items.map(renderItemCard).join('');
        const categoryIdClean = escapeHtml(categoryId).replace(/\s+/g, '-');

        const pendingCountHtml = categoryData.pending_items !== undefined
            ? `<span class="category-count">${categoryData.pending_items} pendente${categoryData.pending_items !== 1 ? 's' : ''}</span>`
            : '';

        return `
            <div class="category-group">
                <div class="category-header" data-category="${escapeHtml(categoryId)}">
                    <div class="category-title">
                        <span>${escapeHtml(categoryData.title)}</span>
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

    function renderItemsList(itemsByCategory) {
        const categoryIds = Object.keys(itemsByCategory);

        if (categoryIds.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Nenhum item disponível</p>
                </div>
            `;
        }

        return categoryIds.map(categoryId => {
            const categoryData = itemsByCategory[categoryId];
            return renderCategoryGroup(categoryId, categoryData, false);
        }).join('');
    }

    function attachItemListListeners() {
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                const itemData = card.getAttribute('data-item');
                if (itemData) {
                    try {
                        const item = JSON.parse(itemData);
                        vscode.postMessage({ type: 'openItem', item });
                        vscode.postMessage({ type: 'openChat', itemId: item.id });
                    } catch (e) {
                        console.error('Error parsing item data:', e);
                    }
                }
            });
        });

        const categoryHeaders = document.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const categoryName = header.getAttribute('data-category');
                if (categoryName) {
                    const categoryId = categoryName.replace(/\s+/g, '-');
                    const arrow = header.querySelector(`[data-arrow="${categoryId}"]`);
                    const items = header.parentElement.querySelector(`[data-items="${categoryId}"]`);

                    if (arrow && items) {
                        const isCurrentlyExpanded = !items.classList.contains('collapsed');

                        if (isCurrentlyExpanded) {
                            items.classList.add('collapsed');
                            arrow.classList.remove('expanded');
                        } else {
                            items.classList.remove('collapsed');
                            arrow.classList.add('expanded');
                        }
                    }
                }
            });
        });
    }

    function initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'logout' });
            });
        }

        attachItemListListeners();
    }

    // Escuta as atualizações vindas de sendItemsToWebview() (dados
    // reais buscados da API, chegando depois do render() inicial
    // que usa só o cache, possivelmente vazio)
    window.addEventListener('message', (event) => {
        const message = event.data;

        if (message.type === 'update' && message.itemsByCategory) {
            const itemsList = document.getElementById('itemsList');
            if (itemsList) {
                itemsList.innerHTML = renderItemsList(message.itemsByCategory);
                attachItemListListeners();
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }
})();