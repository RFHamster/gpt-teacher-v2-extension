// Dashboard Screen Script
(function() {
    const vscode = acquireVsCodeApi();

    let state = {
        username: null,
        itemsByCategory: {},
        expandedCategories: {}
    };

    // DOM Elements
    const usernameText = document.getElementById('usernameText');
    const itemsCountText = document.getElementById('itemsCountText');
    const logoutBtn = document.getElementById('logoutBtn');
    const itemsList = document.getElementById('itemsList');

    // Event Listeners
    logoutBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'logout' });
    });

    // Request initial data
    vscode.postMessage({ type: 'requestData' });

    // Listen for messages from extension
    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'update') {
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
        // Update header
        usernameText.textContent = state.username || 'Usuário';
        
        const totalItems = Object.values(state.itemsByCategory)
            .reduce((sum, items) => sum + items.length, 0);
        itemsCountText.textContent = totalItems;

        // Render items list
        renderItemsList();
    }

    function renderItemsList() {
        itemsList.innerHTML = '';

        const categories = Object.keys(state.itemsByCategory);

        if (categories.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Nenhum item disponível</p>
                </div>
            `;
            return;
        }

        categories.forEach(categoryName => {
            const categoryGroup = createCategoryGroup(categoryName);
            itemsList.appendChild(categoryGroup);
        });
    }

    function createCategoryGroup(categoryName) {
        const items = state.itemsByCategory[categoryName];
        const isExpanded = state.expandedCategories[categoryName];

        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'category-group';

        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            <div class="category-title">
                <span>${categoryName}</span>
                <span class="category-count">${items.length}</span>
            </div>
            <span class="category-arrow ${isExpanded ? 'expanded' : ''}">▶</span>
        `;
        categoryHeader.addEventListener('click', () => toggleCategory(categoryName));
        categoryGroup.appendChild(categoryHeader);

        // Category items
        const categoryItems = document.createElement('div');
        categoryItems.className = `category-items ${isExpanded ? '' : 'collapsed'}`;

        items.forEach(item => {
            const itemCard = createItemCard(item);
            categoryItems.appendChild(itemCard);
        });

        categoryGroup.appendChild(categoryItems);

        return categoryGroup;
    }

    function createItemCard(item) {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
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
        `;
        itemCard.addEventListener('click', () => openItem(item));

        return itemCard;
    }

    function toggleCategory(categoryName) {
        state.expandedCategories[categoryName] = !state.expandedCategories[categoryName];
        render();
    }

    function openItem(item) {
        vscode.postMessage({ type: 'openItem', item });
    }

    // Initial render
    render();
})();