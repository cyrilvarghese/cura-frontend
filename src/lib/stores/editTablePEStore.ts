import { writable } from 'svelte/store';
import { testTableService } from '$lib/services/editPhysicalExamTableService';

interface TestTableState {
    isUpdating: boolean;
    error: string | null;
    comments?: string[];
    totalComments?: number;
    testName?: string;
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
        },
        addComment: async (
            caseId: string,
            testName: string,
            testType: string,
            comment: string
        ) => {
            update(state => ({ ...state, isUpdating: true, error: null }));

            try {
                const response = await testTableService.addComment({
                    case_id: caseId,
                    test_name: testName,
                    test_type: testType,
                    comment
                });

                update(state => ({
                    ...state,
                    isUpdating: false,
                    comments: response.comments,
                    totalComments: response.total_comments,
                    testName: response.test_name
                }));
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    isUpdating: false,
                    error: error instanceof Error ? error.message : 'Failed to add comment'
                }));
                return false;
            }
        },
        removeComment: async (
            caseId: string,
            testName: string,
            testType: string,
            commentIndex: number
        ) => {
            update(state => ({ ...state, isUpdating: true, error: null }));

            try {
                const response = await testTableService.removeComment({
                    case_id: caseId,
                    test_name: testName,
                    test_type: testType,
                    comment_index: commentIndex
                });

                update(state => ({
                    ...state,
                    isUpdating: false,
                    comments: response.comments,
                    totalComments: response.remaining_comments,
                    testName: response.test_name
                }));
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    isUpdating: false,
                    error: error instanceof Error ? error.message : 'Failed to remove comment'
                }));
                return false;
            }
        }
    };
}

export const editPhysicalExamTableStore = createEditPhysicalExamTableStore(); 