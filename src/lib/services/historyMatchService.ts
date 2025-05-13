import { API_BASE_URL } from '$lib/config/api';
import type { HistoryMatchResponse } from '$lib/types';

/**
 * Fetches unmatched questions data from the API
 * @returns Promise with the history match data
 */
export async function fetchUnmatchedQuestions(): Promise<HistoryMatchResponse> {
    try {
        ;
        const response = await fetch(`${API_BASE_URL}/history-match/unmatched-questions`);

        if (!response.ok) {
            throw new Error(`Error fetching unmatched questions: ${response.statusText}`);
        }

        const data: HistoryMatchResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch unmatched questions:', error);
        throw error;
    }
}

// Create and export the historyMatchApi object
export const historyMatchApi = {
    getUnmatchedQuestions: fetchUnmatchedQuestions,
    getUnmatchedQuestionsForCase: fetchUnmatchedQuestionsForCase
};

/**
 * Fetches unmatched questions for a specific case and student
 * @param caseId The case ID
 * @param studentId The student ID
 * @returns Promise with the history match data
 */
export async function fetchUnmatchedQuestionsForCase(
    caseId: string,
    studentId: string
): Promise<HistoryMatchResponse> {
    try {
        const url = new URL(`${API_BASE_URL}/history-match/unmatched-questions`);

        // Add query parameters if provided
        if (caseId) url.searchParams.append('case_id', caseId);
        if (studentId) url.searchParams.append('student_id', studentId);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Error fetching unmatched questions: ${response.statusText}`);
        }

        const data: HistoryMatchResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch unmatched questions for case:', error);
        throw error;
    }
} 