import { API_BASE_URL } from '$lib/config/api';

export class TestDataService {
    private baseUrl = API_BASE_URL;
 



    async createExamTestData(selectedDocumentName: string, caseId?: string | null): Promise<any> {
        const response = await fetch(`${this.baseUrl}/exam_test_data/create`, {
            method: 'POST',
            body: JSON.stringify({ case_id: caseId, file_name: selectedDocumentName }),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create examination test data');
        }

        return response.json();
    }


    async getExamTestData(caseId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/cases/${caseId}`);
        return response.json();
    }
}

export const testDataService = new TestDataService(); 