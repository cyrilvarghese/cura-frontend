import { API_BASE_URL } from '$lib/config/api';
import mockPrimaryDxFeedback from "$lib/data/feedback-p1.json";
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

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
                    alignsWithKeyEvidence: string | null;
                    studentDidIdentify: boolean;
                }>;
                exams: Array<{
                    name: string;
                    expectedFindingSupportingDx: string;
                    alignsWithKeyEvidence: string;
                    studentDidPerform: boolean;
                    studentDidIdentifyFinding: boolean;
                }>;
                tests: Array<{
                    name: string;
                    expectedResultSupportingDx: string;
                    alignsWithKeyEvidence: string | null;
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
                educationalTip: string | null;
            }>;
        };
        idealDiagnosticTimeline: Array<{
            stepNumber: number;
            type: string;
            actionDescription: string;
            rationaleTags: string[];
            detailedRationale: string;
        }>;
    };
}

export class PrimaryDiagnosisService {
    private baseUrl = API_BASE_URL;

    async getPrimaryDiagnosisFeedback(caseId: string): Promise<PrimaryDiagnosisFeedback> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/v2/primary-diagnosis`);

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