import { writable } from 'svelte/store';
import { testTableService } from '$lib/services/editTablePEService';

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
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    isUpdating: false,
                    error: error instanceof Error ? error.message : 'Failed to update table'
                }));
                return false;
            }
        },
        deleteRow: async (
            caseId: string,
            testName: string,
            testType: string,
            rowIdentifier: string
        ) => {
            update(state => ({ ...state, isUpdating: true, error: null }));

            try {
                await testTableService.deleteRow({
                    case_id: caseId,
                    test_name: testName,
                    test_type: testType,
                    row_identifier: rowIdentifier
                });

                update(state => ({ ...state, isUpdating: false }));
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    isUpdating: false,
                    error: error instanceof Error ? error.message : 'Failed to delete row'
                }));
                return false;
            }
        },
        reset: () => {
            set({ isUpdating: false, error: null });
        }
    };
}

export const editPhysicalExamTableStore = createEditPhysicalExamTableStore(); 