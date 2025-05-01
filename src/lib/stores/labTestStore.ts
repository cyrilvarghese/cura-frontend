import { writable, get } from 'svelte/store';
import type { DiagnosticTestName } from '$lib/types/index';
import type { TestResult } from '$lib/types/index';
import { caseDataStore } from './casePlayerStore';

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

    async function orderTest(testName: DiagnosticTestName, generatedData?: any) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            // Get data from caseDataStore instead of lab test service
            const caseData = get(caseDataStore);
            if (!caseData) {
                throw new Error('Case data not loaded');
            }

            let result: TestResult;

            // Check if the test exists in case data
            if (testName in caseData.labTestReports) {
                // Use type assertion to tell TypeScript this is safe
                const testData = caseData.labTestReports[testName as keyof typeof caseData.labTestReports];

                result = {
                    testName,
                    purpose: testData.purpose,
                    results: testData.results,
                    interpretation: testData.interpretation,
                    timestamp: new Date(),
                    status: 'completed' as const,
                    comments: [],
                    isVerified: false
                };
            }
            // If we have generated data, use it
            else if (generatedData) {
                result = {
                    testName: generatedData.testName,
                    purpose: generatedData.purpose,
                    results: generatedData.results,
                    interpretation: generatedData.interpretation,
                    timestamp: new Date(),
                    status: generatedData.status || 'completed' as const,
                    comments: generatedData.comments || [],
                    isVerified: generatedData.isVerified || false
                };
            }
            // No data available
            else {
                throw new Error(`Lab test data not found for ${testName}`);
            }

            update(state => ({
                ...state,
                results: [...state.results, result],
                isLoading: false
            }));

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