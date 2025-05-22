import { writable, get } from 'svelte/store';
import { primaryDiagnosisService, type PrimaryDiagnosisFeedback } from '$lib/services/primaryDiagnosisFeedbackService';
import { currentCaseId } from "$lib/stores/casePlayerStore";

/**
 * This is a dedicated store for the PrimaryDiagnosisCard component.
 * Note: The feedbackStore also provides access to the primary diagnosis data.
 * Components can choose to use either this dedicated store or the main feedbackStore
 * depending on their requirements.
 */
interface PrimaryDiagnosisState {
    primaryDiagnosisFeedback: PrimaryDiagnosisFeedback | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PrimaryDiagnosisState = {
    primaryDiagnosisFeedback: null,
    isLoading: false,
    error: null
};

function createPrimaryDiagnosisStore() {
    const { subscribe, update, set } = writable<PrimaryDiagnosisState>(initialState);

    async function getPrimaryDiagnosisFeedback(caseId?: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            // Use provided caseId or get it from the casePlayerStore
            const activeCaseId = caseId || get(currentCaseId) || '';

            const response = await primaryDiagnosisService.getPrimaryDiagnosisFeedback(activeCaseId);

            update(state => ({
                ...state,
                primaryDiagnosisFeedback: response,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get primary diagnosis feedback';
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
        getPrimaryDiagnosisFeedback,
        reset
    };
}

export const primaryDiagnosisStore = createPrimaryDiagnosisStore(); 