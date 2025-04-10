import type { FeedbackResponse, FeedbackState, StudentMessage } from "$lib/types";
import { API_BASE_URL } from '$lib/config/api';
import mockFeedback from "$lib/data/mock-feedback.json";
import mockFeedback2 from "$lib/data/mock-feedback2.json";

export class FeedbackService {
    private baseUrl = API_BASE_URL;

    async getFeedback(studentMessageHistory: StudentMessage[], caseId: string): Promise<FeedbackResponse> {
        // Return different mock data based on caseId
        // if (caseId === '2') {
        //     return Promise.resolve(mockFeedback2 as unknown as FeedbackResponse);
        // }
        // else {
        //     return Promise.resolve(mockFeedback as unknown as FeedbackResponse);
        // }   


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

    }
}

export const feedbackService = new FeedbackService(); 