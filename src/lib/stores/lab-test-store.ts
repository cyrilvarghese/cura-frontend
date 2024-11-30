import { writable } from 'svelte/store';
import type { DiagnosticTestName } from '$lib/types';
import type { TestResult } from '$lib/types';
import { labTestService } from '$lib/services/labTestService';

interface LabState {
    results: TestResult[];
    isLoading: boolean;
    error: string | null;
    selectedRows: string[];
    sorting: { id: string; desc: boolean }[];
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}

const initialState: LabState = {
    results: [],
    isLoading: false,
    error: null,
    selectedRows: [],
    sorting: [],
    pagination: {
        pageIndex: 0,
        pageSize: 10
    }
};

function createLabStore() {
    const { subscribe, update } = writable<LabState>(initialState);

    async function orderTest(testName: DiagnosticTestName) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const testData = await labTestService.getLabTestData(testName);

            const result: TestResult = {
                testName,
                purpose: testData.purpose,
                results: testData.results,
                interpretation: testData.interpretation,
                timestamp: new Date(),
                status: 'pending'
            };

            update(state => ({
                ...state,
                results: [...state.results, result],
                isLoading: false
            }));

            // Simulate test completion after 5 seconds
            setTimeout(() => {
                update(state => {
                    const updatedResults = state.results.map(r => {
                        if (r.testName === result.testName) {
                            return {
                                ...r,
                                status: 'completed' as const,
                                results: testData.results,
                                interpretation: testData.interpretation
                            };
                        }
                        return r;
                    });
                    return { ...state, results: updatedResults };
                });
            }, 5000);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to order laboratory test';
            update(state => ({
                ...state,
                error: errorMessage,
                isLoading: false
            }));
            return null;
        }
    }

    return {
        subscribe,
        orderTest,
        setSelectedRows: (ids: string[]) => {
            update(state => ({ ...state, selectedRows: ids }));
        },
        setSorting: (sorting: { id: string; desc: boolean }[]) => {
            update(state => ({ ...state, sorting }));
        },
        setPagination: (pagination: { pageIndex: number; pageSize: number }) => {
            update(state => ({ ...state, pagination }));
        }
    };
}

export const laboratoryStore = createLabStore(); 