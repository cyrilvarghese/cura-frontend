import { writable, derived, get } from 'svelte/store';
import type { DomainStats, HistoryMatchResponse, UnmatchedQuestion } from '$lib/types';
import { fetchUnmatchedQuestions, fetchMatchedQuestions } from '$lib/services/historyMatchService';
import { API_BASE_URL } from '$lib/config/api';

// Define initial state
const initialState: Partial<HistoryMatchResponse> = {
    unmatched_questions: [],
    domain_stats: {},
    metadata: {
        total_expected_questions: 0,
        total_newly_covered_questions: 0,
        total_remaining_questions: 0,
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
        // Pass the current unmatched questions from the store to the API
        const currentState = get(historyMatchStore);
        const data = await fetchUnmatchedQuestions(currentState.unmatched_questions as UnmatchedQuestion[]);

        // Compare domain stats and keep higher values from the current state
        if (currentState.domain_stats && data.domain_stats) {
            const mergedDomainStats = { ...data.domain_stats };

            Object.entries(currentState.domain_stats as Record<string, DomainStats>).forEach(([domain, oldStats]) => {
                if (mergedDomainStats[domain]) {
                    // For each metric, keep the higher value (completed, percent_complete)
                    if (oldStats.completed > mergedDomainStats[domain].completed) {
                        mergedDomainStats[domain].completed = oldStats.completed;
                    }

                    if (oldStats.percent_complete > mergedDomainStats[domain].percent_complete) {
                        mergedDomainStats[domain].percent_complete = oldStats.percent_complete;
                    }

                    // Recalculate remaining based on total and completed
                    mergedDomainStats[domain].remaining =
                        mergedDomainStats[domain].total - mergedDomainStats[domain].completed;
                }
            });

            // Update the data with merged stats
            data.domain_stats = mergedDomainStats;
        }

        historyMatchStore.set(data);
        return data;
    } catch (error) {
        console.error('Error refreshing history match data:', error);
        return null;
    }
}


export default historyMatchStore; 