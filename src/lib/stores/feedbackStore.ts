import { writable, get } from 'svelte/store';
import { feedbackService } from '$lib/services/feedbackService';
import type { FeedbackResponse, StudentMessage } from '$lib/types/index';
import type { OsceGenerationResponse, HistoryFeedbackResponse, AETCOMFeedbackResponse, DiagnosisFeedbackResponse } from '$lib/services/feedbackService';
import { currentCaseId } from "$lib/stores/casePlayerStore";

interface FeedbackState {
    annotations: null | any;
    feedback: null | any;
    total_score: null | number;
    suggestions: null | any;
    isLoading: boolean;
    error: null | string;
    osceData: null | OsceGenerationResponse;
    historyFeedback: null | HistoryFeedbackResponse;
    AETCOMFeedback: null | AETCOMFeedbackResponse;
    diagnosisFeedback: null | DiagnosisFeedbackResponse;
    historyFeedbackLoading: boolean;
    AETCOMFeedbackLoading: boolean;
    diagnosisFeedbackLoading: boolean;
}

const initialState: FeedbackState = {
    annotations: null,
    feedback: null,
    total_score: null,
    suggestions: null,
    isLoading: false,
    error: null,
    osceData: null,
    historyFeedback: null,
    AETCOMFeedback: null,
    diagnosisFeedback: null,
    historyFeedbackLoading: false,
    AETCOMFeedbackLoading: false,
    diagnosisFeedbackLoading: false
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
        update(state => ({ ...state, historyFeedbackLoading: true, error: null }));

        try {
            const response = await feedbackService.getHistoryFeedback();

            update(state => ({
                ...state,
                historyFeedback: response,
                historyFeedbackLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get history analysis';
            update(state => ({
                ...state,
                error: errorMessage,
                historyFeedbackLoading: false
            }));
            throw error;
        }
    }

    async function getAETCOMFeedback() {
        update(state => ({ ...state, AETCOMFeedbackLoading: true, error: null }));

        try {
            const response = await feedbackService.getAETCOMFeedback();

            update(state => ({
                ...state,
                AETCOMFeedback: response,
                AETCOMFeedbackLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get domain feedback';
            update(state => ({
                ...state,
                error: errorMessage,
                AETCOMFeedbackLoading: false
            }));
            throw error;
        }
    }

    async function getDiagnosisFeedback() {
        update(state => ({ ...state, diagnosisFeedbackLoading: true, error: null }));

        try {
            const response = await feedbackService.getDiagnosisFeedback();

            update(state => ({
                ...state,
                diagnosisFeedback: response,
                diagnosisFeedbackLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get diagnosis feedback';
            update(state => ({
                ...state,
                error: errorMessage,
                diagnosisFeedbackLoading: false
            }));
            throw error;
        }
    }

    return {
        subscribe,
        getFeedback,
        generateFinalOsce,
        getHistoryFeedback,
        getDiagnosisFeedback,
        getAETCOMFeedback,
        reset
    };
}

export const feedbackStore = createFeedbackStore(); 