import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from '$lib/utils/auth-handler';

export interface ClinicalFindingsRequest {
    case_id: string;
    findings: string[];
}

export class ClinicalFindingsService {
    private baseUrl = API_BASE_URL;

    async recordFindings(request: ClinicalFindingsRequest): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/record-clinical-findings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            await handleApiResponse(response);
            return response.json();
        } catch (error) {
            console.error('Error recording clinical findings:', error);
            throw error;
        }
    }
} 