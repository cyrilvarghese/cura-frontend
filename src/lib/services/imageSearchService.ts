import type { ApiResponse } from '$lib/types';
import { API_BASE_URL } from '$lib/config/api';

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
        const response = await fetch(
            `${this.baseUrl}/image-search/search_medical_images?query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to search medical images');
        }

        const apiResponse: ApiResponse = await response.json();
        return apiResponse as ImageSearchResponse;
    }
}

export const imageSearchService = new ImageSearchService(); 