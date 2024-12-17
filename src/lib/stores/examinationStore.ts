import { writable, get } from 'svelte/store';
import type { ExaminationState, ExaminationResult, FindingContent, ExaminationName } from '$lib/types';
import { caseDataStore } from './casePlayerStore';

function createExaminationStore() {
    const { subscribe, update } = writable<ExaminationState>({
        results: [],
        isLoading: false,
        error: null
    });

    async function performPhysicalExam(examName: ExaminationName) {
        update(state => ({ ...state, isLoading: true, error: null }));
        try {
            // Get data from caseDataStore instead of examination service
            const caseData = get(caseDataStore);
            if (!caseData) {
                throw new Error('Case data not loaded');
            }

            const examData = caseData.physicalExamReports[examName];
            if (!examData) {
                throw new Error(`Examination data not found for ${examName}`);
            }

            // Ensure findings is in the correct format
            const findings = typeof examData.findings === 'string'
                ? { type: 'text' as const, content: examData.findings }
                : { ...examData.findings } as FindingContent;

            const result: ExaminationResult = {
                name: examName,
                purpose: examData.purpose,
                findings,
                timestamp: new Date(),
                status: 'completed',
                interpretation: examData.interpretation
            };

            update(state => ({
                ...state,
                results: [...state.results, result],
                isLoading: false
            }));

            return result;
        } catch (error) {
            update(state => ({
                ...state,
                error: error instanceof Error ? error.message : 'Failed to perform physical examination',
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