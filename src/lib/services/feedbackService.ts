import type { FeedbackResponse, FeedbackState, StudentMessage } from "$lib/types";
import { API_BASE_URL } from '$lib/config/api';
import mockFeedback from "$lib/data/mock-feedback.json";

export class FeedbackService {
    private baseUrl = API_BASE_URL;

    async getFeedback(studentMessageHistory: StudentMessage[], caseId: string): Promise<FeedbackResponse> {
        // Return mock data instead of making API call
        return Promise.resolve(mockFeedback as unknown as FeedbackResponse);

        /* Commented out API call for now
        try {
            const url = caseId
                ? `${this.baseUrl}/get-feedback?case_id=${encodeURIComponent(caseId)}`
                : `${this.baseUrl}/get-feedback`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentMessageHistory)
            });

            if (!response.ok) {
                throw new Error('Failed to get feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting feedback:', error);
            throw error;
        }
        */
    }
}

export const feedbackService = new FeedbackService(); 