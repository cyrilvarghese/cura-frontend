import { writable, get } from 'svelte/store';
import { differentialDiagnosisService, type DifferentialDiagnosisFeedback } from '$lib/services/differentialDiagnosisService';
import { currentCaseId } from "$lib/stores/casePlayerStore";

/**
 * This is a dedicated store for the DifferentialDiagnosisCard component.
 * Components can use this store to access differential diagnosis feedback data.
 */
interface DifferentialDiagnosisState {
    differentialDiagnosisFeedback: DifferentialDiagnosisFeedback | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DifferentialDiagnosisState = {
    differentialDiagnosisFeedback: null,
    isLoading: false,
    error: null
};

function createDifferentialDiagnosisStore() {
    const { subscribe, update, set } = writable<DifferentialDiagnosisState>(initialState);

    async function getDifferentialDiagnosisFeedback(caseId?: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            // Use provided caseId or get it from the casePlayerStore
            const activeCaseId = caseId || get(currentCaseId) || '';

            const response = await differentialDiagnosisService.getDifferentialDiagnosisFeedback(activeCaseId);

            update(state => ({
                ...state,
                differentialDiagnosisFeedback: response,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get differential diagnosis feedback';
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
        getDifferentialDiagnosisFeedback,
        reset
    };
}

export const differentialDiagnosisFeedbackStore = createDifferentialDiagnosisStore(); 