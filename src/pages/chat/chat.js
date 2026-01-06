// Chat Page - Event Handlers
(function() {
    const vscode = acquireVsCodeApi();

    // Initialize event listeners when DOM is ready
    function initializeEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const openItemBtn = document.getElementById('openItemBtn');
        const chatMessages = document.getElementById('chatMessages');

        // Get session data from container
        const chatContainer = document.querySelector('.chat-container');
        let sessionData = null;
        if (chatContainer) {
            const sessionJson = chatContainer.getAttribute('data-session');
            if (sessionJson) {
                try {
                    sessionData = JSON.parse(sessionJson);
                } catch (e) {
                    console.error('Error parsing session data:', e);
                }
            }
        }

        // Auto-scroll to bottom on load
        scrollToBottom();

        // Send message handler
        function sendMessage() {
            if (!chatInput || !sessionData) {
                return;
            }

            const message = chatInput.value.trim();
            if (message === '') {
                return;
            }

            // Send message to extension
            vscode.postMessage({
                type: 'sendChatMessage',
                sessionId: sessionData.sessionId,
                itemId: sessionData.itemId,
                content: message
            });

            // Clear input
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatInput.focus();
        }

        // Send button click handler
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', sendMessage);
        }

        // Chat input handlers
        if (chatInput) {
            // Auto-resize textarea as user types
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });

            // Send on Enter (but allow Shift+Enter for new lines)
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Close chat button handler
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'closeChat' });
            });
        }

        // Open item description button handler
        if (openItemBtn && sessionData) {
            openItemBtn.addEventListener('click', () => {
                vscode.postMessage({
                    type: 'openItemFromChat',
                    itemId: sessionData.itemId
                });
            });
        }

        // Listen for messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;
            console.log('[chat.js] Received message from extension:', message);

            switch (message.type) {
                case 'chatMessageReceived':
                    // New message received, append to DOM
                    console.log('[chat.js] Appending new message:', message.message);
                    appendMessage(message.message);
                    scrollToBottom();
                    break;

                case 'chatUpdated':
                    // Full chat update (could refresh entire chat)
                    console.log('[chat.js] Chat updated:', message);
                    break;
            }
        });
    }

    // Helper function to scroll chat to bottom
    function scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    // Helper function to append a new message to chat
    function appendMessage(message) {
        console.log('[chat.js] appendMessage called with:', message);
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages || !message) {
            console.warn('[chat.js] chatMessages element or message not found');
            return;
        }

        // Remove empty state if it exists
        const emptyState = chatMessages.querySelector('.empty-chat');
        if (emptyState) {
            emptyState.remove();
        }

        const isUser = message.sender === 'user';
        const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'message-user' : 'message-assistant'}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${isUser ? 'Você' : 'Assistente'}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
        `;

        chatMessages.appendChild(messageDiv);
        console.log('[chat.js] Message appended to DOM');
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }
})();
