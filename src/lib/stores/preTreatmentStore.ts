import { writable } from 'svelte/store';
import { PreTreatmentService, type PreTreatmentResponse } from '$lib/services/preTreatmentService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const preTreatmentService = new PreTreatmentService();

function createPreTreatmentStore() {
    const { subscribe, set, update } = writable<{
        lastEvaluation: PreTreatmentResponse | null;
        isLoading: boolean;
        error: string | null;
    }>({
        lastEvaluation: null,
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        evaluatePreTreatment: async (input: string[]) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }

            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const evaluation = await preTreatmentService.evaluatePreTreatment(input, caseId);
                update(state => ({
                    ...state,
                    lastEvaluation: evaluation,
                    isLoading: false
                }));
                return evaluation;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate pre-treatment';
                update(state => ({
                    ...state,
                    error: errorMessage,
                    isLoading: false
                }));
                throw error;
            }
        },
        evaluateMonitoring: async (monitoringInputs: string[]) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }


            try {
                update(state => ({ ...state, loading: true, error: null }));

                const response = await preTreatmentService.evaluateMonitoring(
                    monitoringInputs,
                    caseId
                );

                const { feedback } = response;

                update(state => ({
                    ...state,
                    loading: false,
                    error: null
                }));

                return feedback;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                }));
                throw error;
            }
        },
        reset: () => {
            set({
                lastEvaluation: null,
                isLoading: false,
                error: null
            });
        }
    };
}

export const preTreatmentStore = createPreTreatmentStore(); 