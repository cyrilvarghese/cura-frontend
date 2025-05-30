import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface UploadTestAssetResponse {
    message: string;
    image_urls?: string[];
    case_id: string;
    test_name: string;
    test_type: string;
    file_path: string;
}

export interface UploadTestAssetFromUrlRequest {
    case_id: string;
    test_name: string;
    test_type: 'physical_exam' | 'lab_test';
    image_url: string;
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

        const response = await makeAuthenticatedRequest(
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

    async uploadMultipleTestAssets(
        files: File[],
        caseId: string,
        testName: string,
        testType: 'physical_exam' | 'lab_test'
    ): Promise<UploadTestAssetResponse[]> {
        const formData = new FormData();

        // Append each file with the same field name 'files'
        files.forEach(file => {
            formData.append('files', file);
        });

        formData.append('case_id', caseId);
        formData.append('test_name', testName);
        formData.append('test_type', testType);

        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/test-image/upload`,  // Using the same endpoint as single upload
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload multiple test assets');
        }

        return await response.json();
    }

    async uploadTestAssetFromUrl(
        request: UploadTestAssetFromUrlRequest
    ): Promise<UploadTestAssetResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/test-image/upload-from-url`,
            {
                method: 'POST',
                body: request
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload test asset from URL');
        }

        return await response.json();
    }

    async deleteTestAsset(
        caseId: string,
        testType: 'physical_exam' | 'lab_test',
        testName: string
    ): Promise<{ success: boolean; message: string }> {
        const encodedTestName = encodeURIComponent(testName);
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/test-image/delete/${caseId}/${testType}/${encodedTestName}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete test asset');
        }

        return await response.json();
    }
}

export const testAssetService = new TestAssetService();