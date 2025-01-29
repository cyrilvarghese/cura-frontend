import { writable, get } from 'svelte/store';
import { feedbackService } from '$lib/services/feedbackService';
import type { FeedbackState, StudentMessage } from '$lib/types/index';
import { currentCaseId } from "$lib/stores/casePlayerStore";



const initialState: FeedbackState = {
    annotations: null,
    feedback: null,
    total_score: null,
    suggestions: null,
    isLoading: false,
    error: null
};

function createFeedbackStore() {
    const { subscribe, update, set } = writable<FeedbackState>(initialState);

    async function getFeedback(studentMessageHistory: StudentMessage[]) {
            update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await feedbackService.getFeedback(studentMessageHistory, get(currentCaseId) ?? '');

            update(state => ({
                ...state,
                annotations: response.annotations,
                feedback: response.feedback,
                total_score: response.total_score,
                suggestions: response.suggestions,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get feedback';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    function reset() {
        set(initialState);
    }

    return {
        subscribe,
        getFeedback,
        reset
    };
}

export const feedbackStore = createFeedbackStore(); 