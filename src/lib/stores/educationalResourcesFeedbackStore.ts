import { writable, get } from 'svelte/store';
import { educationalResourcesService, type EducationalResourcesFeedback } from '$lib/services/educationalResourcesService';
import { currentCaseId } from "$lib/stores/casePlayerStore";

/**
 * This is a dedicated store for the EducationalResourcesCard component.
 * Components can use this store to access educational resources data.
 */
interface EducationalResourcesState {
    educationalResourcesFeedback: EducationalResourcesFeedback | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: EducationalResourcesState = {
    educationalResourcesFeedback: null,
    isLoading: false,
    error: null
};

function createEducationalResourcesStore() {
    const { subscribe, update, set } = writable<EducationalResourcesState>(initialState);

    async function getEducationalResources(caseId?: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            // Use provided caseId or get it from the casePlayerStore
            const activeCaseId = caseId || get(currentCaseId) || '';

            const response = await educationalResourcesService.getEducationalResources(activeCaseId);

            update(state => ({
                ...state,
                educationalResourcesFeedback: response,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get educational resources';
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
        getEducationalResources,
        reset
    };
}

export const educationalResourcesFeedbackStore = createEducationalResourcesStore(); 