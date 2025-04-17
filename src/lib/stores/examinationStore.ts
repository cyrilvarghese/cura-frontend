import { writable, get } from 'svelte/store';
import type { ExaminationName, ExaminationResult, FindingContent } from '$lib/types/index';
import { caseDataStore } from './casePlayerStore';

interface ExaminationState {
    results: ExaminationResult[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ExaminationState = {
    results: [],
    isLoading: false,
    error: null
};

function createExaminationStore() {
    const { subscribe, update } = writable<ExaminationState>(initialState);

    async function performPhysicalExam(examName: ExaminationName, generatedData?: any) {
        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            const caseData = get(caseDataStore);
            if (!caseData) {
                throw new Error('Case data not loaded');
            }

            let result: ExaminationResult;

            // Check if the exam exists in case data
            if (examName in caseData.physicalExamReports) {
                const examData = caseData.physicalExamReports[examName as keyof typeof caseData.physicalExamReports];

                result = {
                    name: examName,
                    purpose: examData.purpose,
                    findings: examData.findings,
                    timestamp: new Date(),
                    status: 'completed' as const,
                    interpretation: examData.interpretation || '',
                    comments: [],
                    isVerified: true
                };
            }
            // If we have generated data, use it
            else if (generatedData) {
                result = {
                    name: generatedData.testName || examName,
                    purpose: generatedData.purpose,
                    findings: generatedData.findings,
                    status: generatedData.status || 'completed' as const,
                    interpretation: generatedData.interpretation || '',
                    timestamp: new Date(),
                    comments: generatedData.comments || [],
                    isVerified: true
                };
            }
            // No data available
            else {
                throw new Error(`Physical exam data not found for ${examName}`);
            }

            update(state => ({
                ...state,
                results: [...state.results, result],
                isLoading: false
            }));

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to perform physical examination';
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
        performPhysicalExam
    };
}

export const examinationStore = createExaminationStore(); 