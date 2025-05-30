import type { FeedbackResponse, StudentMessage } from "$lib/types/index";
import { API_BASE_URL } from '$lib/config/api';
import mockFeedback from "$lib/data/mock-feedback.json";
import mockFeedback2 from "$lib/data/mock-feedback2.json";
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockOsce2 from "$lib/data/mock-osce2.json";
import type { PrimaryDiagnosisFeedback } from "./primaryDiagnosisFeedbackService";
import type { DifferentialDiagnosisFeedback } from "./differentialDiagnosisService";
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

interface OsceQuestion {
    station_title: string;
    question_format: "MCQ" | "image-based" | "written";
    prompt: string;
    options?: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    expected_answer?: string;
    image_placeholder_url?: string;
    explanation: string;
    concept_modal: {
        specific: string;
        general: string;
        lateral: string;
    };
}

interface DiagnosisFeedbackResponse {
    case_id: string;
    student_id: string;
    timestamp: string;
    feedback_result: {
        evaluationSummary: {
            physicalExamPerformance: number;
            testOrderingPerformance: number;
            primaryDiagnosisAccuracy: number;
            reasoningQuality: number;
            differentialListMatch: number;
        };
        scoreBreakdown: {
            physicalExams: {
                score: number;
                explanation: string;
                missedItems: Array<{
                    name: string;
                    specificRelevance: string;
                    generalDescription: string;
                    educationalTip: string | null;
                }>;
            };
            testsOrdered: {
                score: number;
                explanation: string;
                missedItems: Array<{
                    name: string;
                    specificRelevance: string;
                    generalDescription: string;
                    educationalTip: string | null;
                }>;
            };
            diagnosisAccuracy: {
                score: number;
                explanation: string;
                educationalTip: string;
            };
            reasoningQuality: {
                score: number;
                explanation: string;
                educationalTip: string;
            };
            differentials: {
                score: number;
                explanation: string;
                educationalTip: string;
            };
        };
    };
    metadata: {
        processing_time_seconds: number;
        model_version: string;
    };
}

interface OsceGenerationResponse {
    case_id: string;
    student_id: string;
    department: string;
    timestamp: string;
    osce_questions: OsceQuestion[];
    metadata: {
        processing_time_seconds: number;
        model_version: string;
        generation_config: {
            temperature: number;
            top_p: number;
            top_k: number;
        };
    };
}


interface HistoryFeedbackResponse {
    case_id: string;
    student_id: string;
    timestamp: string;
    analysis_result: {
        student_question_evaluation: Array<any>; // This appears to be empty in the example
        critical_missed_areas: Array<{
            domain: string;
            importance_reason: string;
            example_missed_question: string;
        }>;
        summary_feedback: {
            key_strength: string;
            key_weakness: string;
            cumulative_score: number;
            score_reason: string;
        };
    };
    metadata: {
        processing_time_seconds: number;
        model_version: string;
    };
}

interface AETCOMFeedbackResponse {
    case_id: string;
    student_id: string;
    timestamp: string;
    feedback_result: {
        aetcom_evaluation: {
            communication: {
                performance_level: string;
                feedback: string;
            };
            empathy_patient_centeredness: {
                performance_level: string;
                feedback: string;
            };
            professionalism_ethics: {
                performance_level: string;
                feedback: string;
            };
            information_gathering: {
                performance_level: string;
                feedback: string;
            };
        };
    };
    metadata: {
        processing_time_seconds: number;
        model_version: string;
    };
}

export interface FeedbackRequest {
    case_id: string;
    feedback_data: any;
}

export class FeedbackService {
    private baseUrl = API_BASE_URL;

    async getFeedback(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/feedback`);
        return response.json();
    }

    async updateFeedback(caseId: string, feedbackData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/feedback`, {
            method: 'PUT',
            body: feedbackData
        });
        return response.json();
    }

    async submitFeedback(request: FeedbackRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-feedback`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    async createFeedback(fileName: string, caseId: string): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/create`, {
                method: 'POST',
                body: {
                    file_name: fileName,
                    case_id: caseId
                }
            });
            return response.json();
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    }

    async generateFinalOsce(caseId: string): Promise<OsceGenerationResponse> {
        // Return mock data instead of making an API call
        // return Promise.resolve(mockOsce2 as unknown as OsceGenerationResponse);

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/osce/generate`, {
                method: 'POST',
                body: {
                    case_id: caseId
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error generating OSCE:', error);
            throw error;
        }
    }

    async getHistoryFeedback(): Promise<HistoryFeedbackResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/history-taking/analysis`);
            return await response.json();
        } catch (error) {
            console.error('Error getting history analysis:', error);
            throw error;
        }
    }

    async getAETCOMFeedback(): Promise<AETCOMFeedbackResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/history-taking/aetcom`);
            return await response.json();
        } catch (error) {
            console.error('Error getting AETCOM feedback:', error);
            throw error;
        }
    }

    async getDiagnosisFeedback(): Promise<DiagnosisFeedbackResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/diagnosis/feedback`);
            return await response.json();
        } catch (error) {
            console.error('Error getting diagnosis feedback:', error);
            throw error;
        }
    }

    async getPrimaryDiagnosisFeedback(caseId: string): Promise<PrimaryDiagnosisFeedback> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/primary-diagnosis`);
            return await response.json();
        } catch (error) {
            console.error('Error getting primary diagnosis feedback:', error);
            throw error;
        }
    }

    async getDifferentialDiagnosisFeedback(caseId: string): Promise<DifferentialDiagnosisFeedback> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/v2/differential-diagnosis`);
            const data = await response.json();
            return { differentialDxAnalysis: data.feedback_result.differentialDxAnalysis };
        } catch (error) {
            console.error('Error getting differential diagnosis feedback:', error);
            throw error;
        }
    }
}

export const feedbackService = new FeedbackService();
export type {
    OsceGenerationResponse,
    OsceQuestion,
    HistoryFeedbackResponse,
    AETCOMFeedbackResponse,
    DiagnosisFeedbackResponse,
    PrimaryDiagnosisFeedback,
    DifferentialDiagnosisFeedback
}; 