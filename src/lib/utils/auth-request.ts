import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';
import { handleApiResponse } from './auth-handler';

export interface AuthenticatedRequestOptions {
    method?: string;
    body?: any;
    additionalHeaders?: Record<string, string>;
}

export async function makeAuthenticatedRequest(
    url: string,
    options: AuthenticatedRequestOptions = {}
): Promise<Response> {
    const auth = get(authStore);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`,
        ...(options.additionalHeaders || {})
    };

    if (auth.refreshToken) {
        headers['X-Refresh-Token'] = auth.refreshToken;
    }

    const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers
    };

    if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);
    await handleApiResponse(response);
    return response;
} 