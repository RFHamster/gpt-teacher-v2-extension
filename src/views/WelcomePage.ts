import { BasePage } from './BasePage';

export class WelcomePage extends BasePage {
    private pageName = 'welcome';

    getPageName(): string {
        return this.pageName;
    }

    render(): string {
        return `
            <div class="welcome-screen">
                <div class="welcome-icon">📚</div>
                <h1 class="welcome-title">Bem-vindo ao GPT Teacher!</h1>
                <p class="welcome-subtitle">Faça login para acessar seus itens e começar a aprender.</p>
                <button class="btn" id="loginBtn">Fazer Login</button>
                <div class="dev-info">
                    <strong>Dev:</strong> rhuan / rhuan
                </div>
            </div>
        `;
    }
}
