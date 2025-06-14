import { writable, get, derived } from 'svelte/store';
import { authService } from '../services/authService';
import mixpanel from "mixpanel-browser";

export interface AuthState {
    user: {
        id: string;
        email: string;
        username: string;
        role: string;
    } | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    accessToken: null,
    refreshToken: null
};

function createAuthStore() {
    // Initialize from localStorage if available
    const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
    const initialAuthState = storedAuth ? JSON.parse(storedAuth) : initialState;

    const { subscribe, update, set } = writable<AuthState>(initialAuthState);

    async function signup(email: string, password: string, username: string, role: string, inviteCode?: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await authService.signup({ email, password, username, role, invite_code: inviteCode });

            const newState = {
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                accessToken: response.access_token,
                refreshToken: response.refresh_token
            };

            mixpanel.identify(response.user.id)

            mixpanel.people.set({
                '$name': response.user.username,
                '$email': response.user.email,
                'plan': 'Free',
                'role': response.user.role

            });

            mixpanel.track('Signup', {
                'email': response.user.email,
                'role': response.user.role
            });

            set(newState);

            if (typeof window !== 'undefined') {
                localStorage.setItem('auth', JSON.stringify(newState));
            }

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    async function login(email: string, password: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await authService.login(email, password);

            const newState = {
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                error: null
            };

            set(newState);

            if (typeof window !== 'undefined') {
                localStorage.setItem('auth', JSON.stringify(newState));
            }

            mixpanel.identify(response.user.id)

            mixpanel.people.set({
                '$name': response.user.username,
                '$email': response.user.email,
                'plan': 'Free',
                'role': response.user.role

            });

            mixpanel.track('Login', {
                'email': response.user.email,
                'role': response.user.role
            });

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    async function logout() {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            await authService.logout();
            set(initialState);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    function reset() {
        set(initialState);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth');
        }
    }

    return {
        subscribe,
        signup,
        login,
        logout,
        reset
    };
}

export const authStore = createAuthStore();

// Add a derived store for isAuthenticated
export const isAuthenticated = derived(authStore, $store => $store.isAuthenticated); 