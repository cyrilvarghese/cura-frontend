import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from '$lib/utils/auth-handler';

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
            const response = await fetch(`${this.baseUrl}/final-diagnosis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            await handleApiResponse(response);
            return response.json();
        } catch (error) {
            console.error('Error recording final diagnosis:', error);
            throw error;
        }
    }
} 