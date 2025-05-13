import { writable, derived } from 'svelte/store';
import type { DomainStats, HistoryMatchResponse, UnmatchedQuestion } from '$lib/types';
import { fetchUnmatchedQuestions } from '$lib/services/historyMatchService';
import { API_BASE_URL } from '$lib/config/api';

// Define initial state
const initialState: Partial<HistoryMatchResponse> = {
    unmatched_questions: [],
    domain_stats: {},
    metadata: {
        total_expected_questions: 0,
        total_student_questions: 0,
        total_unmatched_questions: 0,
        processing_time_seconds: 0,
        model_version: ''
    }
};

// Create the store
const historyMatchStore = writable<Partial<HistoryMatchResponse>>(initialState);

// Derived store for domain stats
export const domainStatsStore = derived(
    historyMatchStore,
    $historyMatchStore => $historyMatchStore.domain_stats as Record<string, DomainStats>
);

// Derived store for unmatched questions
export const unmatchedQuestionsStore = derived(
    historyMatchStore,
    $historyMatchStore => $historyMatchStore.unmatched_questions as UnmatchedQuestion[]
);

// Function to refresh the history match data
export async function refreshHistoryMatchData() {
    try {
        const data = await fetchUnmatchedQuestions();
        historyMatchStore.set(data);
        return data;
    } catch (error) {
        console.error('Error refreshing history match data:', error);
        return null;
    }
}

// Function to refresh the history match data for a specific case and student
export async function refreshHistoryMatchDataForCase(caseId: string, studentId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/history-match/unmatched-questions?case_id=${caseId}&student_id=${studentId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch history match data: ${response.statusText}`);
        }

        const data = await response.json();
        historyMatchStore.set(data);
        return data;
    } catch (error) {
        console.error('Error refreshing history match data for case:', error);
        return null;
    }
}

export default historyMatchStore; 