import { API_BASE_URL } from '$lib/config/api';
import { toast } from 'svelte-sonner';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

interface SignupData {
    email: string;
    password: string;
    username: string;
    role: string;
    invite_code?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        role: string;
    };
    access_token: string;
    refresh_token: string;
}

export class AuthService {
    private baseUrl = API_BASE_URL;

    async signup(data: SignupData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.dismiss();
                toast.error('Signup failed', {
                    description: errorData.message || 'Please try again later'
                });
                throw new Error('Signup failed');
            }

            const result = await response.json();
            toast.success('Signup successful', {
                description: 'Welcome to our platform!'
            });
            return result;
        } catch (error) {
            console.error('Error during signup:', error);
            toast.error('Signup failed', {
                description: error instanceof Error ? error.message : 'Please try again later'
            });
            throw error;
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        debugger;
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error('Login failed', {
                    description: errorData.message || 'Invalid credentials'
                });
                throw new Error('Login failed');
            }

            const result = await response.json();
            toast.dismiss();
            toast.success('Login successful', {
                description: 'Welcome back!'
            });
            return result;
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Login failed', {
                description: error instanceof Error ? error.message : 'Please try again later'
            });
            throw error;
        }
    }

    async refreshToken(refreshToken: string) {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        return response.json();
    }

    async validateToken() {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/auth/validate`);
        return response.json();
    }

    async logout(): Promise<void> {
        try {
            await makeAuthenticatedRequest(`${this.baseUrl}/auth/logout`, {
                method: 'POST'
            });
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('Logout failed', {
                description: error instanceof Error ? error.message : 'Please try again later'
            });
            throw error;
        }
    }
}

export const authService = new AuthService(); 