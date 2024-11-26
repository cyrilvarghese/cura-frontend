import { writable } from 'svelte/store';
import { examinationData, type ExaminationName  } from './examination-data';
import type { ExaminationState, ExaminationResult, FindingContent } from '$lib/types';

function createExaminationStore() {
    const { subscribe, update } = writable<ExaminationState>({
        results: [],
        isLoading: false,
        error: null
    });

    async function performPhysicalExam(examName: ExaminationName) {
        update(state => ({ ...state, isLoading: true, error: null }));
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const examData = examinationData[examName];
            
            // Ensure findings is in the correct format
            const findings = typeof examData.findings === 'string' 
                ? { type: 'text' as const, content: examData.findings }
                : { ...examData.findings } as FindingContent;
            
            const result: ExaminationResult = {
                name: examName,
                purpose: examData.purpose,
                findings: examData.findings,
                timestamp: new Date(),
                status: 'completed'
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
                error: 'Failed to perform physical examination',
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