import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import type { HistoryMatchResponse, UnmatchedQuestion } from '$lib/types';
import { apiStore } from '$lib/stores/apiStore';
import type { Message } from '../types/index';

export interface HistoryMatchRequest {
    case_id: string;
    history_data: any;
}

export class HistoryMatchService {
    private baseUrl = API_BASE_URL;

    async getHistoryMatch(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/history-match`);
        return response.json();
    }

    async updateHistoryMatch(caseId: string, historyData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/history-match`, {
            method: 'PUT',
            body: historyData
        });
        return response.json();
    }

    async submitHistoryMatch(request: HistoryMatchRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-history-match`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting history match:', error);
            throw error;
        }
    }
}

export const historyMatchService = new HistoryMatchService();

/**
 * Fetches unmatched questions data from the API
 * @returns Promise with the history match data
 */
export async function fetchUnmatchedQuestions(
    remainingUnmatchedQuestions?: UnmatchedQuestion[]
): Promise<HistoryMatchResponse> {
    try {
        // Ensure we're sending a proper array, even if empty
        const questionsToSend = Array.isArray(remainingUnmatchedQuestions)
            ? remainingUnmatchedQuestions
            : [];

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/history-match/unmatched-questions`, {
            method: 'POST',
            body: {
                remaining_unmatched_questions: questionsToSend
            }
        });
        return response.json();
    } catch (error) {
        console.error('Failed to fetch unmatched questions:', error);
        throw error;
    }
}

/**
 * Fetches matched questions data for a single interaction
 * @param currentInteraction The current student-patient interaction
 * @returns Promise with the matched questions data
 */
export async function fetchMatchedQuestions(): Promise<HistoryMatchResponse> {
    try {
        // Get the last two messages for context
        let messagesLatest: Message[] = [];
        apiStore.subscribe(state => {
            messagesLatest = state.messages.slice(-2);
        });

        // Format the interaction in the expected format
        const currentInteraction = {
            student_question: messagesLatest[0]?.sender === "student" ? messagesLatest[0].content : "",
            patient_reply: messagesLatest[1]?.sender === "patient" ? messagesLatest[1].content : ""
        };

        console.log("Current interaction being sent:", currentInteraction);

        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/history-match/match-single-interaction`, {
            method: 'POST',
            body: {
                current_interaction: currentInteraction
            }
        });
        return response.json();
    } catch (error) {
        console.error('Failed to fetch matched questions:', error);
        throw error;
    }
}

// Create and export the historyMatchApi object
export const historyMatchApi = {
    getUnmatchedQuestions: fetchUnmatchedQuestions,
    getMatchedQuestions: fetchMatchedQuestions,
};

