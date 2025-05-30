import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export class TestDataService {
    private baseUrl = API_BASE_URL;

    async createExamTestData(selectedDocumentName: string, caseId?: string | null): Promise<any> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/exam_test_data/create`, {
            method: 'POST',
            body: { case_id: caseId, file_name: selectedDocumentName }
        });

        if (!response.ok) {
            throw new Error('Failed to create examination test data');
        }

        return response.json();
    }

    async getExamTestData(caseId: string): Promise<any> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}`);
        return response.json();
    }
}

export const testDataService = new TestDataService(); 