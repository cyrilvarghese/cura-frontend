import { writable } from 'svelte/store';
import { testTableService } from '$lib/services/testTableService';

interface TestTableState {
    isUpdating: boolean;
    error: string | null;
}

function createEditPhysicalExamTableStore() {
    const { subscribe, set, update } = writable<TestTableState>({
        isUpdating: false,
        error: null
    });

    return {
        subscribe,
        updateTable: async (
            caseId: string,
            testName: string,
            testType: string,
            rowData: (string | number)[]
        ) => {
            update(state => ({ ...state, isUpdating: true, error: null }));

            try {
                await testTableService.updateTable({
                    case_id: caseId,
                    test_name: testName,
                    test_type: testType,
                    rows: [{ values: rowData }]
                });

                update(state => ({ ...state, isUpdating: false }));
            } catch (error) {
                update(state => ({
                    ...state,
                    isUpdating: false,
                    error: error instanceof Error ? error.message : 'Failed to update table'
                }));
            }
        },
        reset: () => {
            set({ isUpdating: false, error: null });
        }
    };
}

export const editPhysicalExamTableStore = createEditPhysicalExamTableStore(); 