import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface TreatmentContextRequest {
    case_id: string;
    treatment_data: any;
}

export interface TreatmentContextResponse {
    case_id: number;
    content: {
        treatment_context: {
            treatment_plan: string;
            monitoring_plan: string;
            patient_education: string;
            follow_up_plan: string;
            prevention_strategies: string;
        };
    };
    file_path: string;
    timestamp: string;
    type: string;
}

export class TreatmentContextService {
    private baseUrl = API_BASE_URL;

    async getTreatmentContext(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/treatment-context`);
        return response.json();
    }

    async updateTreatmentContext(caseId: string, treatmentData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/treatment-context`, {
            method: 'PUT',
            body: treatmentData
        });
        return response.json();
    }

    async submitTreatmentContext(request: TreatmentContextRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-treatment-context`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting treatment context:', error);
            throw error;
        }
    }

    async createTreatmentContext(fileName: string, caseId: string): Promise<TreatmentContextResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/treatment_context/create`, {
                method: 'POST',
                body: {
                    file_name: fileName,
                    case_id: caseId
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating treatment context:', error);
            throw error;
        }
    }
}

export const treatmentContextService = new TreatmentContextService(); 