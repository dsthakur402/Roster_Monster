import { fetchWithAuth } from '../utils/fetchWithAuth';
import { User } from '../types/user';

interface LoginCredentials {
    username: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

class AuthService {
    private tokenKey = 'authToken';
    private userKey = 'user';

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await fetchWithAuth('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: credentials.username,
                password: credentials.password,
            }),
            skipAuth: true,
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem(this.tokenKey, data.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(data.user));
        return data;
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    getCurrentRole(): string | null {
        const user = this.getUser();
        return user?.userType;
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(this.tokenKey);
    }

    isAdmin(): boolean {
        const user = this.getUser();
        return user?.userType === 'ADMIN';
    }

    async refreshToken(): Promise<string | null> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        try {
            const response = await fetchWithAuth('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    refresh_token: refreshToken
                }),
                skipAuth: true,
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.tokenKey, data.access_token);
                return data.access_token;
            }
            return null;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    getUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }
}

export const authService = new AuthService(); 