import { API_BASE_URL } from '$lib/config/api';

export interface UploadTestAssetResponse {
    file_path: string;
    test_name: string;
    test_type: string;
}

export class TestAssetService {
    private baseUrl = API_BASE_URL;

    async uploadTestAsset(
        file: File, 
        caseId: string, 
        testName: string, 
        testType: 'physical_exam' | 'lab_test'
    ): Promise<UploadTestAssetResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('case_id', caseId);
        formData.append('test_name', testName);
        formData.append('test_type', testType);

        const response = await fetch(
            `${this.baseUrl}/test-image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload test asset');
        }

        return await response.json();
    }
}

export const testAssetService = new TestAssetService();