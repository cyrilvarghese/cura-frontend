import { writable } from 'svelte/store';
import { TestValidatorService, type TestValidationResponse } from '$lib/services/testValidatorService';
import type { DiagnosticTestName } from '$lib/types/index';

interface TestValidatorState {
    isValidating: boolean;
    currentCaseId: string | null;
    lastValidatedTest: string | null;
    validationResult: TestValidationResponse | null;
    error: string | null;
}

const initialState: TestValidatorState = {
    isValidating: false,
    currentCaseId: null,
    lastValidatedTest: null,
    validationResult: null,
    error: null
};

function createTestValidatorStore() {
    const { subscribe, set, update } = writable<TestValidatorState>(initialState);
    const service = new TestValidatorService();

    return {
        subscribe,
        setCaseId: (caseId: string) => {
            update(state => ({ ...state, currentCaseId: caseId }));
        },
        validateTest: async (testName: DiagnosticTestName, testType: string, caseId?: string) => {
            update(state => ({
                ...state,
                isValidating: true,
                error: null
            }));

            try {
                const useCase = caseId || initialState.currentCaseId;

                if (!useCase) {
                    throw new Error('No case ID provided for test validation');
                }

                const result = await service.validateTest({
                    case_id: useCase,
                    test_type: testType as 'lab_test' | 'physical_exam',
                    test_name: testName
                });

                update(state => ({
                    ...state,
                    isValidating: false,
                    lastValidatedTest: testName,
                    validationResult: result
                }));

                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

                update(state => ({
                    ...state,
                    isValidating: false,
                    error: errorMessage
                }));

                throw error;
            }
        },
        reset: () => {
            set(initialState);
        }
    };
}

export const testValidatorStore = createTestValidatorStore(); 