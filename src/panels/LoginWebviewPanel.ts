import * as vscode from 'vscode';
import { AuthService, LoginCredentials, AuthResponse } from './services/AuthService';
import { StorageService } from './services/StorageService';

export class LoginWebviewPanel {
    public static currentPanel: LoginWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _onLoginSuccess: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onLoginSuccess: vscode.Event<void> = this._onLoginSuccess.event;

    private constructor(
        panel: vscode.WebviewPanel,
        private extensionUri: vscode.Uri,
        private storageService: StorageService
    ) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtmlContent();

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'login':
                        await this._handleLogin(message.username, message.password);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri, storageService: StorageService) {
        const column = vscode.ViewColumn.One;

        if (LoginWebviewPanel.currentPanel) {
            LoginWebviewPanel.currentPanel._panel.reveal(column);
            return LoginWebviewPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'gptTeacherLogin',
            'GPT Teacher - Login',
            column,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        LoginWebviewPanel.currentPanel = new LoginWebviewPanel(panel, extensionUri, storageService);
        return LoginWebviewPanel.currentPanel;
    }

    private async _handleLogin(username: string, password: string) {
        const credentials: LoginCredentials = { username, password };
        const response: AuthResponse = await AuthService.login(credentials);

        if (response.success && response.token) {
            // Salvar no storage
            await this.storageService.save_login_data(username, response.token);

            // Notificar sucesso para o webview
            this._panel.webview.postMessage({
                command: 'loginSuccess',
                message: response.message
            });

            // Emitir evento de sucesso
            this._onLoginSuccess.fire();

            // Fechar o painel após 1 segundo
            setTimeout(() => {
                this.dispose();
            }, 1000);
        } else {
            // Notificar erro para o webview
            this._panel.webview.postMessage({
                command: 'loginError',
                message: response.message || 'Erro ao fazer login'
            });
        }
    }

    private _getHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPT Teacher - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .login-container {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: var(--vscode-textLink-foreground);
            font-size: 28px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 14px;
            font-family: var(--vscode-font-family);
        }

        input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
            font-family: var(--vscode-font-family);
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .message {
            margin-top: 20px;
            padding: 12px;
            border-radius: 4px;
            text-align: center;
            display: none;
        }

        .message.success {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }

        .message.error {
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            color: var(--vscode-inputValidation-errorForeground);
        }

        .dev-note {
            margin-top: 20px;
            padding: 10px;
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textLink-foreground);
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .loading {
            display: none;
            text-align: center;
            margin-top: 15px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>GPT Teacher</h1>

        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuário</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    autocomplete="username"
                    placeholder="Digite seu usuário"
                >
            </div>

            <div class="form-group">
                <label for="password">Senha</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autocomplete="current-password"
                    placeholder="Digite sua senha"
                >
            </div>

            <button type="submit" id="loginButton">Entrar</button>

            <div class="loading" id="loading">Autenticando...</div>
        </form>

        <div class="message" id="message"></div>

        <div class="dev-note">
            <strong>Desenvolvimento:</strong><br>
            Usuário: rhuan<br>
            Senha: rhuan
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        const form = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');
        const messageDiv = document.getElementById('message');
        const loadingDiv = document.getElementById('loading');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showMessage('Por favor, preencha todos os campos', 'error');
                return;
            }

            // Mostrar loading
            loginButton.disabled = true;
            loadingDiv.style.display = 'block';
            messageDiv.style.display = 'none';

            // Enviar credenciais para a extensão
            vscode.postMessage({
                command: 'login',
                username: username,
                password: password
            });
        });

        // Receber mensagens da extensão
        window.addEventListener('message', event => {
            const message = event.data;

            loginButton.disabled = false;
            loadingDiv.style.display = 'none';

            switch (message.command) {
                case 'loginSuccess':
                    showMessage(message.message || 'Login realizado com sucesso!', 'success');
                    form.reset();
                    break;
                case 'loginError':
                    showMessage(message.message || 'Erro ao fazer login', 'error');
                    passwordInput.value = '';
                    passwordInput.focus();
                    break;
            }
        });

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
        }

        // Focar no input de usuário ao carregar
        usernameInput.focus();
    </script>
</body>
</html>`;
    }

    public dispose() {
        LoginWebviewPanel.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
