import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface FinalDiagnosisRequest {
    case_id: string;
    diagnosis: string;
}

export interface FinalDiagnosis {
    diagnosis: string;
    justification: string;
}

export class FinalDiagnosisService {
    private baseUrl = API_BASE_URL;

    async getFinalDiagnosis(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/final-diagnosis`);
        return response.json();
    }

    async updateFinalDiagnosis(caseId: string, diagnosisData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/final-diagnosis`, {
            method: 'PUT',
            body: diagnosisData
        });
        return response.json();
    }

    async submitFinalDiagnosis(request: FinalDiagnosisRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-final-diagnosis`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting final diagnosis:', error);
            throw error;
        }
    }
}

export const finalDiagnosisService = new FinalDiagnosisService(); 