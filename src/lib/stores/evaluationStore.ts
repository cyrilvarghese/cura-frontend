import { writable } from 'svelte/store';
import { EvaluationService, type EvaluationResponse } from '$lib/services/evaluationService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const evaluationService = new EvaluationService();

function createEvaluationStore() {
    const { subscribe, set, update } = writable<{
        lastEvaluation: EvaluationResponse | null;
        showMissingFindings: boolean;
        isLoading: boolean;
        error: string | null;
    }>({
        lastEvaluation: null,
        showMissingFindings: false,
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        evaluateFindings: async (findings: string[]) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }

            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const evaluation = await evaluationService.evaluateFindings(findings, caseId);
                update(state => ({
                    ...state,
                    lastEvaluation: evaluation,
                    showMissingFindings: false,
                    isLoading: false
                }));
                return evaluation;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate findings';
                update(state => ({
                    ...state,
                    error: errorMessage,
                    isLoading: false
                }));
                throw error;
            }
        },
        toggleMissingFindings: () => {
            update(state => ({
                ...state,
                showMissingFindings: !state.showMissingFindings
            }));
        },
        reset: () => {
            set({
                lastEvaluation: null,
                showMissingFindings: false,
                isLoading: false,
                error: null
            });
        }
    };
}

export const evaluationStore = createEvaluationStore(); 