import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface ClinicalFindingsRequest {
    case_id: string;
    findings: string[];
}

export interface ClinicalFinding {
    finding: string;
    relevance: string;
}

export interface ClinicalFindingsContextResponse {
    case_id: number;
    content: {
        critical_findings_with_relevance: ClinicalFinding[];
    };
    file_path: string;
    timestamp: string;
    type: string;
}

export class ClinicalFindingsService {
    private baseUrl = API_BASE_URL;

    async getClinicalFindings(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/clinical-findings`);
        return response.json();
    }

    async updateClinicalFindings(caseId: string, findingsData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/clinical-findings`, {
            method: 'PUT',
            body: findingsData
        });
        return response.json();
    }

    async recordClinicalFindings(request: ClinicalFindingsRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/record-clinical-findings`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error recording clinical findings:', error);
            throw error;
        }
    }

    async createClinicalFindingsContext(fileName: string, caseId: string): Promise<ClinicalFindingsContextResponse> {
        try {
            const response = await makeAuthenticatedRequest(
                `${this.baseUrl}/clinical_findings_context/create`,
                {
                    method: 'POST',
                    body: {
                        file_name: fileName,
                        case_id: caseId
                    }
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Error creating clinical findings context:', error);
            throw error;
        }
    }
}

export const clinicalFindingsService = new ClinicalFindingsService(); 