import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface AddTextExamRequest {
    case_id: string;
    test_name: string;
    purpose: string;
    text_content: string;
    interpretation?: string;
    status?: string;
}

export interface AddMixedExamRequest {
    case_id: string;
    test_name: string;
    purpose: string;
    text_content: string;
    interpretation: string;
    status: string;
    url: string[];
}

export interface DeleteExamRequest {
    case_id: string;
    test_name: string;
}

export interface ExamResponse {
    message: string;
    case_id: string;
    test_name: string;
    test_type: string;
    created_at?: string;
    image_urls?: string[];
}

export interface DeleteExamResponse {
    message: string;
    case_id: string;
    test_name: string;
    test_type: string;
    success: boolean;
}

export class EditExamService {
    private baseUrl = API_BASE_URL;

    async addTextExam(request: AddTextExamRequest): Promise<ExamResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/edit-physical-exam/add-text`,
            {
                method: 'POST',
                body: request
            }
        );

        if (!response.ok) {
            throw new Error('Failed to add text examination');
        }

        return await response.json();
    }

    async addMixedExam(request: AddMixedExamRequest): Promise<ExamResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/edit-physical-exam/add-mixed`,
            {
                method: 'POST',
                body: request
            }
        );

        if (!response.ok) {
            throw new Error('Failed to add mixed examination');
        }

        return await response.json();
    }

    async deletePhysicalExam(request: DeleteExamRequest): Promise<DeleteExamResponse> {
        const response = await makeAuthenticatedRequest(
            `${this.baseUrl}/edit-physical-exam/remove-test`,
            {
                method: 'DELETE',
                body: request
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete physical examination');
        }

        return await response.json();
    }
}

export const editExamService = new EditExamService(); 