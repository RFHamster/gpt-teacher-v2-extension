// Item Dashboard - Event Handlers
(function() {
    const vscode = acquireVsCodeApi();

    // Initialize event listeners when DOM is ready
    function initializeEventListeners() {
        // Logout button handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'logout' });
            });
        }

        // Add click listeners to all item cards
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                const itemData = card.getAttribute('data-item');
                if (itemData) {
                    try {
                        const item = JSON.parse(itemData);
                        // Open item detail panel
                        vscode.postMessage({ type: 'openItem', item });
                        // Open chat in sidebar
                        vscode.postMessage({ type: 'openChat', itemId: item.id });
                    } catch (e) {
                        console.error('Error parsing item data:', e);
                    }
                }
            });
        });

        // Add click listeners to category headers for dropdown toggle
        const categoryHeaders = document.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }
})();