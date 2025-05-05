import { writable } from 'svelte/store';
import { OSCEFeedbackService, type OSCEFeedbackResponse, type OSCEQuestion, type StudentResponse, type OSCEScoreRecord, type PerformanceComparisonData } from '$lib/services/osceFeedbackService';
import { currentCaseId } from './casePlayerStore';
import { get } from 'svelte/store';

const osceFeedbackService = new OSCEFeedbackService();

function createOSCEFeedbackStore() {
    const { subscribe, set, update } = writable<{
        feedback: OSCEFeedbackResponse | null;
        isLoading: boolean;
        error: string | null;
        comparisonData: PerformanceComparisonData | null;
    }>({
        feedback: null,
        isLoading: false,
        error: null,
        comparisonData: null
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

        recordOsceFeedback: async (scoreData: OSCEScoreRecord) => {
            update(state => ({ ...state, isLoading: true, error: null }));
            try {
                const response = await osceFeedbackService.recordOsceFeedback(scoreData);
                update(state => ({ ...state, isLoading: false }));
                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to record OSCE score';
                update(state => ({
                    ...state,
                    error: errorMessage,
                    isLoading: false
                }));
                throw error;
            }
        },

        getPerformanceComparison: async (caseId: string) => {
            console.log(`osceFeedbackStore: Starting getPerformanceComparison for case ID: ${caseId}`);

            update(state => {
                console.log('osceFeedbackStore: Setting isLoading to true');
                return { ...state, isLoading: true, error: null };
            });

            try {
                console.log('osceFeedbackStore: Calling service method');
                const comparisonData = await osceFeedbackService.getPerformanceComparison(caseId);

                console.log('osceFeedbackStore: Received data, updating store');
                update(state => {
                    console.log('osceFeedbackStore: Setting comparisonData and isLoading=false');
                    return {
                        ...state,
                        comparisonData,
                        isLoading: false
                    };
                });

                console.log('osceFeedbackStore: Returning data to caller');
                return comparisonData;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance comparison';
                console.error(`osceFeedbackStore: Error: ${errorMessage}`);

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
                error: null,
                comparisonData: null
            });
        }
    };
}

export const osceFeedbackStore = createOSCEFeedbackStore(); 