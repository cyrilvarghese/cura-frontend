import type { FeedbackResponse, StudentMessage } from "$lib/types/index";
import { API_BASE_URL } from '$lib/config/api';
import mockFeedback from "$lib/data/mock-feedback.json";
import mockFeedback2 from "$lib/data/mock-feedback2.json";
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockOsce2 from "$lib/data/mock-osce2.json";

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

export class FeedbackService {
    private baseUrl = API_BASE_URL;

    async getFeedback(studentMessageHistory: StudentMessage[], caseId: string): Promise<FeedbackResponse> {
        // Return different mock data based on caseId
        // if (caseId === '11') {
        //     return Promise.resolve(mockFeedback2 as unknown as FeedbackResponse);
        // }
        // else {
        //     return Promise.resolve(mockFeedback as unknown as FeedbackResponse);
        // }

        try {
            const url = caseId
                ? `${this.baseUrl}/get-feedback?case_id=${encodeURIComponent(caseId)}`
                : `${this.baseUrl}/get-feedback`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentMessageHistory)
            });

            if (!response.ok) {
                throw new Error('Failed to get feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting feedback:', error);
            throw error;
        }

    }

    async generateFinalOsce(caseId: string): Promise<OsceGenerationResponse> {
        // Return mock data instead of making an API call
        // return Promise.resolve(mockOsce2 as unknown as OsceGenerationResponse);

        try {
            const response = await fetch(`${this.baseUrl}/osce/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    case_id: caseId
                })
            });
            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to generate OSCE');
            }

            const data: OsceGenerationResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating OSCE:', error);
            throw error;
        }

    }

    // async getHistoryFeedback(): Promise<HistoryFeedbackResponse> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/feedback/history-taking`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         });

    //         await handleApiResponse(response);

    //         if (!response.ok) {
    //             throw new Error('Failed to get history feedback');
    //         }

    //         return await response.json();
    //     } catch (error) {
    //         console.error('Error getting history feedback:', error);
    //         throw error;
    //     }
    // }

    async getHistoryFeedback(): Promise<HistoryFeedbackResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/feedback/history-taking/analysis`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get history analysis');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting history analysis:', error);
            throw error;
        }
    }

    async getAETCOMFeedback(): Promise<AETCOMFeedbackResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/feedback/history-taking/aetcom`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get AETCOM feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting AETCOM feedback:', error);
            throw error;
        }
    }

    async getDiagnosisFeedback(): Promise<DiagnosisFeedbackResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/feedback/diagnosis/feedback`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get diagnosis feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting diagnosis feedback:', error);
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
    DiagnosisFeedbackResponse
}; 