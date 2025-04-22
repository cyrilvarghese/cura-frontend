import { writable, get } from 'svelte/store';
import { feedbackService } from '$lib/services/feedbackService';
import type { FeedbackResponse, StudentMessage } from '$lib/types/index';
import type { OsceGenerationResponse } from '$lib/services/feedbackService';
import { currentCaseId } from "$lib/stores/casePlayerStore";

interface FeedbackState {
    annotations: null | any;
    feedback: null | any;
    total_score: null | number;
    suggestions: null | any;
    isLoading: boolean;
    error: null | string;
    osceData: null | OsceGenerationResponse;
    historyFeedback: null | any;
}

const initialState: FeedbackState = {
    annotations: null,
    feedback: null,
    total_score: null,
    suggestions: null,
    isLoading: false,
    error: null,
    osceData: null,
    historyFeedback: null
};

function createFeedbackStore() {
    const { subscribe, update, set } = writable<FeedbackState>(initialState);

    async function getFeedback(studentMessageHistory: StudentMessage[]) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            console.log(studentMessageHistory);
            const response = await feedbackService.getFeedback(studentMessageHistory, get(currentCaseId) ?? '');

            update(state => ({
                ...state,
                annotations: response.annotations,
                feedback: response.feedback,
                total_score: response.total_score,
                suggestions: response.suggestions ?? null,
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

    async function generateFinalOsce(caseId: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await feedbackService.generateFinalOsce(caseId);
            update(state => ({
                ...state,
                osceData: response,
                isLoading: false
            }));
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate OSCE';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    async function getHistoryFeedback() {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await feedbackService.getHistoryFeedback();

            // Update store with the feedback
            update(state => ({
                ...state,
                historyFeedback: response.feedback,
                isLoading: false
            }));

            return response.feedback.final_feedback.actionable_suggestions;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get history feedback';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            throw error;
        }
    }

    return {
        subscribe,
        getFeedback,
        generateFinalOsce,
        getHistoryFeedback,
        reset
    };
}

export const feedbackStore = createFeedbackStore(); 