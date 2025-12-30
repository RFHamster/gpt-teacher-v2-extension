// GPT Teacher Webview Script
(function() {
    const vscode = acquireVsCodeApi();

    let state = {
        isAuthenticated: false,
        username: null,
        itemsByCategory: {},
        expandedCategories: {}
    };

    // Request initial data
    vscode.postMessage({ type: 'requestData' });

    // Listen for messages from extension
    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'update') {
            state.isAuthenticated = message.isAuthenticated;
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
        const container = document.getElementById('container');

        if (!state.isAuthenticated) {
            renderWelcomeScreen(container);
        } else {
            renderMainScreen(container);
        }
    }

    function renderWelcomeScreen(container) {
        container.innerHTML = '';

        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-screen';
        welcomeDiv.innerHTML = `
            <div class="welcome-icon">📚</div>
            <h1 class="welcome-title">Bem-vindo ao GPT Teacher!</h1>
            <p class="welcome-subtitle">Faça login para acessar seus itens e começar a aprender.</p>
            <div style="margin-top: 20px; font-size: 12px; color: var(--vscode-descriptionForeground);">
                <strong>Dev:</strong> rhuan / rhuan
            </div>
        `;

        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn';
        loginBtn.textContent = 'Fazer Login';
        loginBtn.addEventListener('click', login);

        welcomeDiv.insertBefore(loginBtn, welcomeDiv.lastElementChild);
        container.appendChild(welcomeDiv);
    }

    function renderMainScreen(container) {
        container.innerHTML = '';

        // Calculate total items
        const totalItems = Object.values(state.itemsByCategory)
            .reduce((sum, items) => sum + items.length, 0);

        // Create header
        const headerDiv = createHeader(totalItems);
        container.appendChild(headerDiv);

        // Create items list with categories
        const itemsListDiv = createItemsList();
        container.appendChild(itemsListDiv);
    }

    function createHeader(totalItems) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'header';
        headerDiv.innerHTML = `
            <div class="user-info">
                <span class="username">👤 ${state.username || 'Usuário'}</span>
                <span class="items-count">• ${totalItems} itens</span>
            </div>
        `;

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-secondary';
        logoutBtn.textContent = 'Sair';
        logoutBtn.addEventListener('click', logout);
        headerDiv.appendChild(logoutBtn);

        return headerDiv;
    }

    function createItemsList() {
        const itemsListDiv = document.createElement('div');
        itemsListDiv.className = 'items-list';

        const categories = Object.keys(state.itemsByCategory);

        if (categories.length === 0) {
            itemsListDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>Nenhum item disponível</p>
                </div>
            `;
        } else {
            categories.forEach(categoryName => {
                const categoryGroup = createCategoryGroup(categoryName);
                itemsListDiv.appendChild(categoryGroup);
            });
        }

        return itemsListDiv;
    }

    function createCategoryGroup(categoryName) {
        const items = state.itemsByCategory[categoryName];
        const isExpanded = state.expandedCategories[categoryName];

        // Category group container
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

    function login() {
        vscode.postMessage({ type: 'login' });
    }

    function logout() {
        vscode.postMessage({ type: 'logout' });
    }

    function openItem(item) {
        vscode.postMessage({ type: 'openItem', item });
    }

    // Initial render
    render();
})();