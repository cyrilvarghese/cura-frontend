import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export class PhrasesToAvoidService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async addPhraseToAvoid(caseId: string, phrase: string): Promise<void> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cover_image/${caseId}/add-phrase-to-avoid`, {
            method: 'POST',
            body: { phrase }
        });

        if (!response.ok) {
            throw new Error('Failed to add phrase to avoid');
        }
    }
}

export const phrasesToAvoidService = new PhrasesToAvoidService(); 