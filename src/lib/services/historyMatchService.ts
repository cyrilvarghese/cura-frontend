import { API_BASE_URL } from '$lib/config/api';
import type { HistoryMatchResponse, UnmatchedQuestion } from '$lib/types';
import { apiStore } from '$lib/stores/apiStore';
import type { Message } from '../types/index';
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

        const response = await fetch(`${API_BASE_URL}/history-match/unmatched-questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                remaining_unmatched_questions: questionsToSend
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Error fetching unmatched questions: ${response.status} ${response.statusText}`);
        }

        const data: HistoryMatchResponse = await response.json();
        return data;
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

        const response = await fetch(`${API_BASE_URL}/history-match/match-single-interaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_interaction: currentInteraction
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Error fetching matched questions: ${response.status} ${response.statusText}`);
        }

        const data: HistoryMatchResponse = await response.json();
        return data;
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

