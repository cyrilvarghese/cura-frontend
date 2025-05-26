import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from '$lib/utils/auth-handler';

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

    async recordDiagnosis(request: DiagnosisRequest): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/record-diagnosis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            await handleApiResponse(response);
            return response.json();
        } catch (error) {
            console.error('Error recording diagnosis:', error);
            throw error;
        }
    }
} 