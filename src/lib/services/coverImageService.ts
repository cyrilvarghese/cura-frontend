import { API_BASE_URL } from '$lib/config/api';
import type { CoverImageResponse } from '$lib/types/index';
 

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

    async generateWithPrompt(caseId: string, prompt: string, title: string, quote: string): Promise<CoverImageResponse> {
        try {
            
            const response = await fetch(`${this.baseUrl}/cover_image/create?case_id=${caseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    caseId,
                    prompt,
                    title,
                    quote
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                image_url: data.image_url,
                prompt: data.prompt,
                title: data.title,
                quote: data.quote,
            };
        } catch (error) {
            console.error('Error in generateWithPrompt:', error);
            throw error;
        }
    }
}

export const coverImageService = new CoverImageService(); 