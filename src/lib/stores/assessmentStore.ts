import { writable } from 'svelte/store';
import { AssessmentService } from '$lib/services/assessmentService';

const assessmentService = new AssessmentService();

function createAssessmentStore() {
    const { subscribe } = writable({});

    return {
        subscribe,
        deleteAssessment: async (assessmentId: number) => {
            try {
                await assessmentService.deleteAssessment(assessmentId);
                // The UI will update when curriculum data is refreshed
            } catch (error) {
                console.error('Error deleting assessment:', error);
                throw error;
            }
        }
    };
}

export const assessmentStore = createAssessmentStore(); 