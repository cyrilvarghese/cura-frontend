import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface FinalDiagnosisRequest {
    case_id: string;
    final_diagnosis: string;
    final_reason: string;
}

export interface FinalDiagnosis {
    diagnosis: string;
    justification: string;
}

export class FinalDiagnosisService {
    private baseUrl = API_BASE_URL;

    async recordFinalDiagnosis(request: FinalDiagnosisRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/final-diagnosis/record`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error recording final diagnosis:', error);
            throw error;
        }
    }
} 