import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockPrimaryDxFeedback from "$lib/data/feedback-p1.json";
import { feedbackService } from './feedbackService';

export interface PrimaryDiagnosisFeedback {
    primaryDxFeedback: {
        studentStated: {
            dx: string;
            isCorrect: boolean;
        };
        correctPrimary: {
            dx: string;
            allSupportingEvidence: {
                history: Array<{
                    desc: string;
                    alignsWithKeyEvidence: string;
                    studentDidIdentify: boolean;
                }>;
                exams: Array<{
                    name: string;
                    expectedFindingSupportingDx: string;
                    studentDidPerform: boolean;
                    studentDidIdentifyFinding: boolean;
                }>;
                tests: Array<{
                    name: string;
                    expectedResultSupportingDx: string;
                    studentDidOrder: boolean;
                    studentDidIdentifyResult: boolean;
                }>;
            };
        };
        scores: {
            accuracyScore: number;
            accuracyExplanation: string;
            evidenceGatheringScore: number;
            evidenceGatheringExplanation: {
                overallSummary: string;
                historyStrengths: string[];
                examStrengths: string[];
                testStrengths: string[];
                areasForImprovement_Exams: string[];
                areasForImprovement_Tests: string[];
                irrelevantActionsNoted: string[];
            };
        };
        missedCrucialEvidence: {
            missedExams: Array<{
                name: string;
                relevance: string;
                educationalTip: string | null;
            }>;
            missedLabs: Array<{
                testName: string;
                relevance: string;
            }>;
        };
    };
}

export class PrimaryDiagnosisService {
    private baseUrl = API_BASE_URL;

    async getPrimaryDiagnosisFeedback(caseId: string): Promise<PrimaryDiagnosisFeedback> {


        // Option 2: Standalone implementation
        /*
        // Uncomment to use mock data for testing*/

        // return Promise.resolve(mockPrimaryDxFeedback as PrimaryDiagnosisFeedback);

        try {
            const response = await fetch(`${this.baseUrl}/feedback/v2/primary-diagnosis`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // You can add query parameters if needed
                // For example: ?case_id=${encodeURIComponent(caseId)}
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get primary diagnosis feedback');
            }

            // Extract the primaryDxFeedback from inside feedback_result
            const data = await response.json();
            return { primaryDxFeedback: data.feedback_result.primaryDxFeedback };
        } catch (error) {
            console.error('Error getting primary diagnosis feedback:', error);
            throw error;
        }

    }
}

export const primaryDiagnosisService = new PrimaryDiagnosisService(); 