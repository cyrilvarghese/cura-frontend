import { API_BASE_URL } from '$lib/config/api';
import type { CoverImageResponse } from '$lib/types/index';

export class CoverImageService {
    private baseUrl = API_BASE_URL;

    async createCoverImage(caseId: string | null): Promise<CoverImageResponse> {
        const response = await fetch(
            `${this.baseUrl}/cover_image/create?case_id=${caseId}`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create cover image');
        }

        return await response.json();
    }
}

export const coverImageService = new CoverImageService(); 