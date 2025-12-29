export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
}

export class AuthService {
    // Hardcoded credentials - será substituído por integração real depois
    private static readonly HARDCODED_USERNAME = 'rhuan';
    private static readonly HARDCODED_PASSWORD = 'rhuan';

    public static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        if (credentials.username === this.HARDCODED_USERNAME &&
            credentials.password === this.HARDCODED_PASSWORD) {
            // Gera um token simples (será substituído por token real da API)
            const token = this.generateToken(credentials.username);

            return {
                success: true,
                token: token,
                message: 'Login realizado com sucesso!'
            };
        }

        return {
            success: false,
            message: 'Usuário ou senha incorretos'
        };
    }

    private static generateToken(username: string): string {
        // Token simples para desenvolvimento
        const timestamp = Date.now();
        return `${username}_${timestamp}_hardcoded_token`;
    }
}
