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

    // Check if body is FormData to handle multipart form data
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${auth.accessToken}`,
        ...(options.additionalHeaders || {})
    };

    // Only set Content-Type for non-FormData requests
    // FormData automatically sets Content-Type with boundary
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth.refreshToken) {
        headers['X-Refresh-Token'] = auth.refreshToken;
    }

    const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers
    };

    if (options.body) {
        // Don't JSON.stringify FormData, use it directly
        requestOptions.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    const response = await fetch(url, requestOptions);
    await handleApiResponse(response);
    return response;
} 