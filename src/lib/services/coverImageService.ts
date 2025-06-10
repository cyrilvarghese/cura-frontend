import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import type { CoverImageResponse } from '$lib/types/index';

export interface ImageGenerationRequest {
    prompt: string;
    case_id: string;
}

export class CoverImageService {
    private baseUrl = API_BASE_URL;

    // Create a cover image for a case

    async createCoverImage(caseId: string | null): Promise<CoverImageResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/cover_image/generate`,
            {
                method: 'POST',
                body: {
                    case_id: caseId
                }
            }
        );
        return await response.json();
    }

    async generateImage(request: ImageGenerationRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/generate-image`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    async updateCoverImage(caseId: string, imageData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/cover-image`, {
            method: 'PUT',
            body: imageData
        });
        return response.json();
    }

    async getCoverImage(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/cover-image`);
        return response.json();
    }

    async generateWithPrompt(case_id: string, prompt: string, title: string, quote: string): Promise<CoverImageResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/cover_image/generate`, {
                method: 'POST',
                body: {
                    case_id,
                    prompt,
                    title,
                    quote
                }
            });

            const data = await response.json();
            return {
                image_url: data.image_url,
                prompt: data.prompt,
                title: data.title,
                quote: data.quote,
                timestamp: data.timestamp,
            };
        } catch (error) {
            console.error('Error in generateWithPrompt:', error);
            throw error;
        }
    }

    async updateQuote(caseId: string, quoteText: string): Promise<CoverImageResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/case_quote/update`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    quote_text: quoteText
                }
            });

            const data = await response.json();
            return {
                image_url: data.image_url,
                prompt: data.prompt,
                title: data.title,
                quote: data.quote,
                timestamp: data.timestamp,
            };
        } catch (error) {
            console.error('Error in updateQuote:', error);
            throw error;
        }
    }
}

export const coverImageService = new CoverImageService(); 