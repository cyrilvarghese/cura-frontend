import { writable } from 'svelte/store';
import type { TestResult, TestStatus } from '$lib/types';

export const diagnosticTestData: Record<string, Omit<TestResult, 'timestamp'>> = {
    "Complete Blood Count and ESR": {
        testName: "Complete Blood Count and ESR",
        purpose: "Evaluate blood cell counts and inflammation",
        results: "ESR: 25 mm/hr (elevated), CBC: Within normal ranges",
        interpretation: "Indicates mild inflammation, consistent with autoimmune or vasculitic processes",
        status: 'completed'
    },
    "ANA Test": {
        testName: "ANA Test",
        purpose: "Screen for autoimmune conditions",
        results: "Positive (1:320 titer, homogeneous pattern)",
        interpretation: "Confirms autoimmune activity, supporting vasculitis or SLE",
        status: 'completed'
    },
    "Complement Levels": {
        testName: "Complement Levels",
        purpose: "Assess complement system function",
        results: "C3: 75 mg/dL (low), C4: 10 mg/dL (low)",
        interpretation: "Strongly supports urticarial vasculitis",
        status: 'completed'
    },
    "Skin Biopsy": {
        testName: "Skin Biopsy",
        purpose: "Confirm vasculitis diagnosis",
        results: "Leukocytoclastic vasculitis with immune complex deposition",
        interpretation: "Confirms urticarial vasculitis diagnosis",
        status: 'completed'
    },
    "Rheumatoid Factor": {
        testName: "Rheumatoid Factor",
        purpose: "Screen for rheumatoid arthritis",
        results: "Negative",
        interpretation: "Rules out rheumatoid arthritis but not other autoimmune processes",
        status: 'completed'
    },
    "Anti-dsDNA and Anti-Sm": {
        testName: "Anti-dsDNA and Anti-Sm",
        purpose: "Evaluate for SLE",
        results: "Negative",
        interpretation: "Makes systemic lupus erythematosus less likely",
        status: 'completed'
    }
} as const;

export type DiagnosticTestName = keyof typeof diagnosticTestData;

function createDiagnosticTestStore() {
    const { subscribe, update } = writable<{
        currentTest: TestResult | null;
        isLoading: boolean;
        error: string | null;
    }>({
        currentTest: null,
        isLoading: false,
        error: null
    });

    async function performTest(testName: DiagnosticTestName) {
        update(state => ({ ...state, isLoading: true, error: null }));
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const testData = diagnosticTestData[testName];
            
            if (!testData) {
                throw new Error(`Test "${testName}" not found`);
            }

            const result: TestResult = {
                ...testData,
                timestamp: new Date()
            };

            update(state => ({
                ...state,
                currentTest: result,
                isLoading: false
            }));

            return result;

        } catch (error) {
            update(state => ({
                ...state,
                error: error instanceof Error ? error.message : 'Failed to perform test',
                isLoading: false
            }));
            return null;
        }
    }

    return {
        subscribe,
        performTest
    };
}

export const diagnosticTestStore = createDiagnosticTestStore(); 