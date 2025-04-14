import { writable } from 'svelte/store';
import { TreatmentProtocolService, type TreatmentProtocolResponse } from '$lib/services/treatmentProtocolService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const treatmentProtocolService = new TreatmentProtocolService();

function createTreatmentProtocolStore() {
    const { subscribe, set, update } = writable<{
        lastEvaluation: TreatmentProtocolResponse | null;
        isLoading: boolean;
        error: string | null;
    }>({
        lastEvaluation: null,
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        evaluateTreatmentProtocol: async (
            drugName: string,
            dosage: string,
            indication: string,
            isPrimary: boolean
        ) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }

            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const evaluation = await treatmentProtocolService.evaluateTreatmentProtocol(
                    caseId,
                    drugName,
                    dosage,
                    indication,
                    isPrimary
                );

                update(state => ({
                    ...state,
                    lastEvaluation: evaluation,
                    isLoading: false
                }));
                return evaluation;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to evaluate treatment protocol';
                update(state => ({
                    ...state,
                    error: errorMessage,
                    isLoading: false
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

export const treatmentProtocolStore = createTreatmentProtocolStore(); 