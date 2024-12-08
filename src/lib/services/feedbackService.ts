import type { FeedbackResponse, FeedbackState, StudentMessage } from "$lib/types";
import { API_BASE_URL } from '$lib/config/api';

export class FeedbackService {
    private baseUrl = API_BASE_URL;

    async getFeedback(studentMessageHistory:StudentMessage[]): Promise<FeedbackResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/get-feedback`, {
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
    }
}

export const feedbackService = new FeedbackService(); 