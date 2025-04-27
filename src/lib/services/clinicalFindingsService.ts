import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from '$lib/utils/auth-handler';
import type { ClinicalFindingsContextResponse } from '$lib/types/caseTypes';

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

    async createClinicalFindingsContext(fileName: string, caseId: string): Promise<ClinicalFindingsContextResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/clinical_findings_context/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        file_name: fileName,
                        case_id: caseId
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create clinical findings context');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating clinical findings context:', error);
            throw error;
        }
    }
} 