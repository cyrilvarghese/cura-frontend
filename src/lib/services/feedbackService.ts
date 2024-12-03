import type { FeedbackResponse, FeedbackState, StudentMessage } from "$lib/types";

 
 
export class FeedbackService {
    private baseUrl = 'http://127.0.0.1:8000'; // adjust based on your API endpoint

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