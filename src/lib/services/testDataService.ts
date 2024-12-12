import { API_BASE_URL } from '$lib/config/api';
import type sticker from 'lucide-svelte/icons/sticker';

export class TestDataService {
    private baseUrl = API_BASE_URL;

    async createExamTestData(caseId: string, pdfFile: File): Promise<any> {
        const formData = new FormData();
        formData.append('pdf_file', pdfFile);
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
}

export const testDataService = new TestDataService(); 