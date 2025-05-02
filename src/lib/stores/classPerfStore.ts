import { writable, derived } from 'svelte/store';
import { teachingService, type CaseSessionData } from '$lib/services/classPerfDataService';
import { currentDepartment } from '$lib/stores/teamStore';

interface TeachingState {
    sessionData: CaseSessionData[] | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: TeachingState = {
    sessionData: null,
    isLoading: false,
    error: null
};

function createTeachingStore() {
    const { subscribe, update, set } = writable<TeachingState>(initialState);

    // Create a derived store that automatically updates when the department changes
    const departmentSubscription = currentDepartment.subscribe(department => {
        if (department) {
            getTeachingSessions(department.name.toLowerCase());
        }
    });

    async function getTeachingSessions(department: string) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await teachingService.getTeachingSessions(department);

            update(state => ({
                ...state,
                sessionData: response,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get teaching data';
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
        getTeachingSessions,
        reset
    };
}

export const teachingStore = createTeachingStore(); 