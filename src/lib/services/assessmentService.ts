import { API_BASE_URL } from '$lib/config/api';

export class AssessmentService {
    private baseUrl = API_BASE_URL;

    async deleteAssessment(assessmentId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/assessments/${assessmentId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete assessment: ${response.statusText}`);
        }
    }
}

 