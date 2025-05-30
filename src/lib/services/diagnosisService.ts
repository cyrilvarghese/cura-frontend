import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface DiagnosisRequest {
    case_id: string;
    primary_diagnosis: string;
    reason: string;
    incorrect_differentials: string[];
    differentials: string[];
}

export interface Diagnosis {
    id: string;
    text: string;
    isPrimary: boolean;
    justification?: string;
    status: "primary" | "differential" | "ruled-out";
}

export class DiagnosisService {
    private baseUrl = API_BASE_URL;

    async getDiagnosis(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/diagnosis`);
        return response.json();
    }

    async updateDiagnosis(caseId: string, diagnosisData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/diagnosis`, {
            method: 'PUT',
            body: diagnosisData
        });
        return response.json();
    }

    async recordDiagnosis(request: DiagnosisRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/record-diagnosis`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error recording diagnosis:', error);
            throw error;
        }
    }
}

export const diagnosisService = new DiagnosisService(); 