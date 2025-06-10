import { writable, get } from 'svelte/store';
import { treatmentFeedbackService, type TreatmentProtocolFeedback } from '$lib/services/treatmentFeedbackService';
import { currentCaseId } from "$lib/stores/casePlayerStore";
import mixpanel from 'mixpanel-browser';
import { currentDepartment } from "$lib/stores/teamStore";

interface TreatmentFeedbackState {
    treatmentFeedback: TreatmentProtocolFeedback | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: TreatmentFeedbackState = {
    treatmentFeedback: null,
    isLoading: false,
    error: null
};

function createTreatmentFeedbackStore() {
    const { subscribe, update, set } = writable<TreatmentFeedbackState>(initialState);

    async function getTreatmentFeedback(treatmentPlan: string[]) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await treatmentFeedbackService.getTreatmentFeedback(treatmentPlan);
            debugger;
            update(state => ({
                ...state,
                treatmentFeedback: response.feedback_result,
                isLoading: false
            }));

            return response.feedback_result;



        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get treatment feedback';
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
        getTreatmentFeedback,
        reset
    };
}

export const treatmentFeedbackStore = createTreatmentFeedbackStore(); 