import { writable } from 'svelte/store';
import { OSCEFeedbackService, type OSCEFeedbackResponse, type OSCEQuestion, type StudentResponse } from '$lib/services/osceFeedbackService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const osceFeedbackService = new OSCEFeedbackService();

function createOSCEFeedbackStore() {
    const { subscribe, set, update } = writable<{
        feedback: OSCEFeedbackResponse | null;
        isLoading: boolean;
        error: string | null;
    }>({
        feedback: null,
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        submitOSCEResponse: async (
            question: OSCEQuestion,
            studentResponse: StudentResponse
        ) => {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error('No case ID found');
            }

            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const feedback = await osceFeedbackService.submitOSCEResponse(
                    caseId,
                    question,
                    studentResponse
                );

                update(state => ({
                    ...state,
                    feedback,
                    isLoading: false
                }));
                return feedback;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit OSCE response';
                update(state => ({
                    ...state,
                    error: errorMessage,
                    isLoading: false
                }));
                throw error;
            }
        },

        reset: () => {
            set({
                feedback: null,
                isLoading: false,
                error: null
            });
        }
    };
}

export const osceFeedbackStore = createOSCEFeedbackStore(); 