import { API_BASE_URL } from '$lib/config/api';
import type { CoverImageResponse } from '$lib/types/index';

interface CoverImagePromptResponse {
    image_url: string;
    prompt: string;
}

export class CoverImageService {
    private baseUrl = API_BASE_URL;

    // Create a cover image for a case

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

    async generateWithPrompt(caseId: string, prompt: string): Promise<CoverImagePromptResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/create?case_id=${caseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    caseId,
                    prompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                image_url: data.image_url,
                prompt: data.prompt
            };
        } catch (error) {
            console.error('Error in generateWithPrompt:', error);
            throw error;
        }
    }
}

export const coverImageService = new CoverImageService(); 