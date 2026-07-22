import { config } from '../config';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
}

interface ErrorResponse {
    detail: string;
}

const CLIENT_ID = 'STUDENT';

export class AuthService {
    public static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const body = new URLSearchParams();
            body.append('username', credentials.username);
            body.append('password', credentials.password);
            body.append('client_id', CLIENT_ID);

            const response = await fetch(`${config.BACKEND_URL}${config.API_ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null) as ErrorResponse | null;
                return {
                    success: false,
                    message: errorData?.detail || 'Usuário ou senha incorretos'
                };
            }

            const data = await response.json() as TokenResponse;

            return {
                success: true,
                token: data.access_token,
                message: 'Login realizado com sucesso!'
            };

        } catch (error) {
            console.error('[AuthService] Erro de conexão:', error);
            return {
                success: false,
                message: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
            };
        }
    }
}