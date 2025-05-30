import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export class AssessmentService {
    private baseUrl = API_BASE_URL;

    async getAssessments() {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/assessments`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch assessments:', error);
            throw error;
        }
    }

    async deleteAssessment(assessmentId: number): Promise<void> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/assessments/${assessmentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete assessment: ${response.statusText}`);
        }
    }
}

export const assessmentService = new AssessmentService();

