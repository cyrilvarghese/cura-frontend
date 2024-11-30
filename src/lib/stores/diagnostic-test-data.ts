import { writable } from 'svelte/store';
import type { TestResult } from '$lib/types';

export const diagnosticTestData: Record<string, Omit<TestResult, 'timestamp'>> = {
    "Complete Blood Count and ESR": {
        testName: "Complete Blood Count and ESR",
        purpose: "Evaluate blood cell counts and inflammation",
        results: {
            type: 'table',
            content: {
                headers: ['Test', 'Result', 'Reference Range', 'Status'],
                rows: [
                    ['ESR', '25 mm/hr', '0-20 mm/hr', 'HIGH'],
                    ['WBC', '7.5 x10⁹/L', '4.0-11.0 x10⁹/L', 'NORMAL'],
                    ['RBC', '4.8 x10¹²/L', '4.2-5.4 x10¹²/L', 'NORMAL'],
                    ['Hemoglobin', '14.2 g/dL', '13.5-17.5 g/dL', 'NORMAL'],
                    ['Platelets', '250 x10⁹/L', '150-450 x10⁹/L', 'NORMAL']
                ]
            }
        },
        interpretation: "Indicates mild inflammation, consistent with autoimmune or vasculitic processes",
        status: 'completed'
    },
    "ANA Test": {
        testName: "ANA Test",
        purpose: "Screen for autoimmune conditions",
        results: {
            type: 'mixed',
            content: [
                {
                    type: 'table',
                    content: {
                        headers: ['Test Component', 'Result', 'Reference'],
                        rows: [
                            ['ANA Titer', '1:320', '< 1:40'],
                            ['Pattern', 'Homogeneous', '-']
                        ]
                    }
                },
                {
                    type: 'text',
                    content: 'Additional Notes: Strong positive reaction observed with homogeneous pattern'
                }
            ]
        },
        interpretation: "Confirms autoimmune activity, supporting vasculitis or SLE",
        status: 'completed'
    },
    "Complement Levels": {
        testName: "Complement Levels",
        purpose: "Assess complement system function",
        results: {
            type: 'table',
            content: {
                headers: ['Component', 'Result', 'Reference Range', 'Status'],
                rows: [
                    ['C3', '75 mg/dL', '90-180 mg/dL', 'LOW'],
                    ['C4', '10 mg/dL', '16-48 mg/dL', 'LOW'],
                    ['CH50', '28 U/mL', '31-60 U/mL', 'LOW']
                ]
            }
        },
        interpretation: "Strongly supports urticarial vasculitis",
        status: 'completed'
    },
    "Skin Biopsy": {
        testName: "Skin Biopsy",
        purpose: "Confirm vasculitis diagnosis",
        results: {
            type: 'mixed',
            content: [
                {
                    type: 'text',
                    content: 'Microscopic Examination:\n' +
                            '- Leukocytoclastic vasculitis present\n' +
                            '- Immune complex deposition confirmed\n' +
                            '- Perivascular neutrophilic infiltrate\n' +
                            '- Small vessel involvement'
                },
                {
                    type: 'image',
                    content: {
                        url: 'https://www.dermatologyadvisor.com/wp-content/uploads/sites/20/2019/03/ch1147.fig2_.jpg',
                        caption: 'Histopathology showing leukocytoclastic vasculitis',
                        altText: 'Microscopic image of skin biopsy showing vasculitis'
                    }
                }
            ]
        },
        interpretation: "Confirms urticarial vasculitis diagnosis",
        status: 'completed'
    },
    "Rheumatoid Factor": {
        testName: "Rheumatoid Factor",
        purpose: "Screen for rheumatoid arthritis",
        results: {
            type: 'table',
            content: {
                headers: ['Test', 'Result', 'Reference Range', 'Status'],
                rows: [
                    ['RF IgM', '< 10 IU/mL', '< 14 IU/mL', 'NEGATIVE']
                ]
            }
        },
        interpretation: "Rules out rheumatoid arthritis but not other autoimmune processes",
        status: 'completed'
    },
    "Anti-dsDNA and Anti-Sm": {
        testName: "Anti-dsDNA and Anti-Sm",
        purpose: "Evaluate for SLE",
        results: {
            type: 'table',
            content: {
                headers: ['Antibody', 'Result', 'Reference Range', 'Status'],
                rows: [
                    ['Anti-dsDNA', '< 10 IU/mL', '< 30 IU/mL', 'NEGATIVE'],
                    ['Anti-Sm', 'Not detected', 'Not detected', 'NEGATIVE']
                ]
            }
        },
        interpretation: "Makes systemic lupus erythematosus less likely",
        status: 'completed'
    }
} as const;

export type DiagnosticTestName = keyof typeof diagnosticTestData;

export type TestResultContent = {
    type: 'text';
    content: string;
} | {
    type: 'table';
    content: TabularData;
} | {
    type: 'image';
    content: {
        url: string;
        caption?: string;
        altText: string;
    };
} | {
    type: 'mixed';
    content: TestResultContent[];
};

export type TabularData = {
    headers: string[];
    rows: (string | number)[][];
};

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