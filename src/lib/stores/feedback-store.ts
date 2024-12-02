import { writable } from 'svelte/store';
import { feedbackService } from '$lib/services/feedbackService';
import type { Diagnosis, FeedbackState } from '$lib/types/index';



const initialState: FeedbackState = {
    feedback: null,
    score: null,
    correctDiagnosis: null,
    explanations: [],
    recommendations: [],
    isLoading: false,
    error: null
};

function createFeedbackStore() {
    const { subscribe, update, set } = writable<FeedbackState>(initialState);

    async function getFeedback(diagnosis: Diagnosis) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await feedbackService.getFeedback(diagnosis);

            update(state => ({
                ...state,
                feedback: response.feedback,
                score: response.score,
                correctDiagnosis: response.correctDiagnosis,
                explanations: response.explanations,
                recommendations: response.recommendations,
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