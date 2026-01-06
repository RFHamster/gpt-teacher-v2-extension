import * as vscode from 'vscode';
import { BasePage } from '../views/BasePage';
import { WelcomePage } from '../views/WelcomePage';
import { ItemDashboardPage } from '../views/ItemDashboardPage';
import { ChatPage } from '../views/ChatPage';
import { StorageService } from './StorageService';

export type RouteType = 'welcome' | 'item_dashboard' | 'chat';

export interface RouteState {
    is_authenticated: boolean;
    is_on_chat: boolean;
    current_item_id?: string;
}

export interface RouteContext {
    extensionUri: vscode.Uri;
    storageService: StorageService;
    context: vscode.ExtensionContext;
    webview: vscode.Webview;
}

type PageFactory = (context: RouteContext) => BasePage;

type RouteResolver = (state: RouteState) => boolean;

interface RouteConfig {
    resolver: RouteResolver;
    factory: PageFactory;
    priority: number;
}

export class RouteService {
    private state: RouteState;

    private readonly routes: Map<RouteType, RouteConfig> = new Map([
        // Priority: quanto maior, mais priorit�rio (checado primeiro)

        // Chat tem prioridade máxima quando ativo
        ['chat', {
            priority: 100,
            resolver: (state) => state.is_authenticated && state.is_on_chat,
            factory: ({ extensionUri, storageService, context }) => {
                return new ChatPage(extensionUri, storageService, context, this.state.current_item_id);
            }
        }],

        // Dashboard para usu�rios autenticados
        ['item_dashboard', {
            priority: 50,
            resolver: (state) => state.is_authenticated,
            factory: ({ extensionUri, storageService }) =>
                new ItemDashboardPage(extensionUri, storageService)
        }],

        // Welcome como fallback (menor prioridade)
        ['welcome', {
            priority: 0,
            resolver: () => true, // sempre aceita (fallback)
            factory: ({ extensionUri }) => new WelcomePage(extensionUri)
        }]
    ]);

    constructor(
        private readonly storageService: StorageService
    ) {
        this.state = this.initializeState();
    }

    private initializeState(): RouteState {
        return {
            is_authenticated: this.storageService.isAuthenticated(),
            is_on_chat: false,
            current_item_id: undefined
        };
    }

    public updateState(partialState: Partial<RouteState>): void {
        this.state = { ...this.state, ...partialState };
    }

    public syncAuthState(): void {
        this.state.is_authenticated = this.storageService.isAuthenticated();
    }

    public syncState(): void {
        this.syncAuthState();
    }

    public getState(): Readonly<RouteState> {
        return { ...this.state };
    }

    public openChat(itemId: string): void {
        this.updateState({
            is_on_chat: true,
            current_item_id: itemId
        });
    }

    public closeChat(): void {
        this.updateState({
            is_on_chat: false,
            current_item_id: undefined
        });
    }

    private resolveRoute(): RouteType {
        this.syncState();

        // Ordena as rotas por prioridade (maior primeiro)
        const sortedRoutes = Array.from(this.routes.entries())
            .sort(([, a], [, b]) => b.priority - a.priority);

        // Retorna a primeira rota que satisfaz a condi��o
        for (const [routeType, config] of sortedRoutes) {
            if (config.resolver(this.state)) {
                return routeType;
            }
        }

        // Fallback para welcome (n�o deve acontecer devido ao resolver: () => true)
        return 'welcome';
    }

    private createPage(route: RouteType, context: RouteContext): BasePage {
        const config = this.routes.get(route);

        if (!config) {
            throw new Error(`Route not found: ${route}`);
        }

        return config.factory(context);
    }

    public render(context: RouteContext, data?: any): string {
        const route = this.resolveRoute();
        const page = this.createPage(route, context);

        return page.renderComplete(context.webview, data);
    }

    public getCurrentRoute(): RouteType {
        return this.resolveRoute();
    }
}
