import * as vscode from 'vscode';

export interface UserMetadata {
    username: string;
    token: string;
    loginDate: string;
    // Adicione outros metadados conforme necessário
}

export class StorageService {
    private static readonly TOKEN_KEY = 'gpt-teacher.auth.token';
    private static readonly USER_METADATA_KEY = 'gpt-teacher.user.metadata';

    constructor(private context: vscode.ExtensionContext) {}

    // Token methods
    public async setToken(token: string): Promise<void> {
        await this.context.globalState.update(StorageService.TOKEN_KEY, token);
    }

    public getToken(): string | undefined {
        return this.context.globalState.get<string>(StorageService.TOKEN_KEY);
    }

    public async clearToken(): Promise<void> {
        await this.context.globalState.update(StorageService.TOKEN_KEY, undefined);
    }

    // User metadata methods
    public async setUserMetadata(metadata: UserMetadata): Promise<void> {
        await this.context.globalState.update(StorageService.USER_METADATA_KEY, metadata);
    }

    public getUserMetadata(): UserMetadata | undefined {
        return this.context.globalState.get<UserMetadata>(StorageService.USER_METADATA_KEY);
    }

    public async clearUserMetadata(): Promise<void> {
        await this.context.globalState.update(StorageService.USER_METADATA_KEY, undefined);
    }

    // Convenience methods
    public isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== undefined && token !== '';
    }

    public async logout(): Promise<void> {
        await this.clearToken();
        await this.clearUserMetadata();
    }

    public async save_login_data(username: string, token: string): Promise<void> {
        await this.setToken(token);

        const metadata: UserMetadata = {
            username: username,
            token: token,
            loginDate: new Date().toISOString()
        };

        await this.setUserMetadata(metadata);
    }
}
