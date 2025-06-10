import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface HistoryContextRequest {
    case_id: string;
    history_data: any;
}

export interface HistoryContextResponse {
    case_id: number;
    content: {
        history_context: {
            chief_complaint: string;
            history_of_present_illness: string;
            past_medical_history: string;
            family_history: string;
            social_history: string;
            review_of_systems: string;
        };
    };
    file_path: string;
    timestamp: string;
    type: string;
}

export class HistoryContextService {
    private baseUrl = API_BASE_URL;

    async getHistoryContext(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/history-context`);
        return response.json();
    }

    async updateHistoryContext(caseId: string, historyData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/history-context`, {
            method: 'PUT',
            body: historyData
        });
        return response.json();
    }

    async submitHistoryContext(request: HistoryContextRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-history-context`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting history context:', error);
            throw error;
        }
    }

    async createHistoryContext(fileName: string, caseId: string): Promise<HistoryContextResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/history_context/create`, {
                method: 'POST',
                body: {
                    file_name: fileName,
                    case_id: caseId
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating history context:', error);
            throw error;
        }
    }
}

export const historyContextService = new HistoryContextService(); 