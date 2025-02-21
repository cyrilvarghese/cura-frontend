import { API_BASE_URL } from '$lib/config/api';

export class TestDataService {
    private baseUrl = API_BASE_URL;

    async createExamTestData(caseId: string, pdfFile: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('case_id', caseId.toString());

        const response = await fetch(`${this.baseUrl}/exam_test_data/create`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to create examination test data');
        }


        return response.json(); // Return the response data
    }

    async getExamTestData(caseId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/cases/${caseId}`);
        return response.json();
    }
}

export const testDataService = new TestDataService(); 