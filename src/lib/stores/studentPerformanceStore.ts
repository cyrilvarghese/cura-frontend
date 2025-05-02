import { writable } from 'svelte/store';
import { studentPerformanceService, type StudentPerformanceData } from '$lib/services/studentPerformanceService';

interface StudentPerformanceState {
    performanceData: StudentPerformanceData[] | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StudentPerformanceState = {
    performanceData: null,
    isLoading: false,
    error: null
};

function createStudentPerformanceStore() {
    const { subscribe, update, set } = writable<StudentPerformanceState>(initialState);

    async function getPerformanceComparison() {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const response = await studentPerformanceService.getPerformanceComparison();

            update(state => ({
                ...state,
                performanceData: response,
                isLoading: false
            }));

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get performance data';
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
        getPerformanceComparison,
        reset
    };
}

export const studentPerformanceStore = createStudentPerformanceStore(); 