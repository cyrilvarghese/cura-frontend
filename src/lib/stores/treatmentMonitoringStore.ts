import { writable } from 'svelte/store';
import { TreatmentMonitoringService, type TreatmentMonitoringResponse } from '$lib/services/treatmentMonitoringService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const treatmentMonitoringService = new TreatmentMonitoringService();

function createTreatmentMonitoringStore() {
    const { subscribe, set, update } = writable<{
        lastSubmission: TreatmentMonitoringResponse | null;
        isLoading: boolean;
        error: string | null;
    }>({
        lastSubmission: null,
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        recordTreatmentMonitoring: async (
            preTreatmentChecks: string[],
            postTreatmentMonitoring: string[]
        ) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }

            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const response = await treatmentMonitoringService.recordTreatmentMonitoring(
                    caseId,
                    preTreatmentChecks,
                    postTreatmentMonitoring
                );

                update(state => ({
                    ...state,
                    lastSubmission: response,
                    isLoading: false
                }));

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to record treatment monitoring';
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
                lastSubmission: null,
                isLoading: false,
                error: null
            });
        }
    };
}

export const treatmentMonitoringStore = createTreatmentMonitoringStore(); 