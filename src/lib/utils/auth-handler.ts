import { authStore } from '$lib/stores/authStore';
import { navigate } from 'svelte-routing';
import { toast } from 'svelte-sonner';

export async function handleApiResponse(response: Response) {
    // Handle 401 status code
    if (response.status === 401) {
        await handleAuthError('Session expired. Please login again.');
        return response;
    }

    // Handle other status codes with auth error messages
    if (!response.ok) {
        try {
            const data = await response.json();
            if (data.detail && (
                data.detail.includes('401: Authentication required') ||
                data.detail.includes('authentication') ||
                data.detail.includes('unauthorized')
            )) {
                await handleAuthError('Session expired. Please login again.');
            }
        } catch (error) {
            // If parsing JSON fails, just return the response
            console.error('Error parsing response:', error);
        }
    }

    return response;
}

async function handleAuthError(message: string) {
    await authStore.logout();
    navigate('/login', { replace: true });
    toast.dismiss();
    toast.error(message);
    throw new Error(message);
} 