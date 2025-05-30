import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface ImageSearchResponse {
    images: Array<{
        url: string;
        title: string;
        source: string;
    }>;
}

export class ImageSearchService {
    private baseUrl = API_BASE_URL;

    async searchMedicalImages(query: string): Promise<ImageSearchResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/image-search/search_medical_images?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error('Failed to search medical images');
        }

        return await response.json();
    }
}

export const imageSearchService = new ImageSearchService(); 