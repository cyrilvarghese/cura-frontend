import { authStore } from '$lib/stores/authStore';
import { navigate } from 'svelte-routing';
import { toast } from 'svelte-sonner';

export async function handleApiResponse(response: Response) {
    if (response.status === 401) {
        await authStore.logout();
        navigate('/login', { replace: true });
        toast.dismiss()
        toast.error('Session expired. Please login again.');
        throw new Error('Session expired. Please login again.');
    }
    return response;
} 