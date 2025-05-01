import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from '$lib/utils/auth-handler';

export interface OSCEQuestion {
    station_title: string;
    question_format: string;
    prompt: string;
    options?: Record<string, string>;
    expected_answer?: string;
    image_placeholder_url?: string;
    explanation: string;
    concept_modal?: {
        specific: string;
        general: string;
        lateral: string;
    };
}

export interface StudentResponse {
    student_mcq_choice_key: string | null;
    student_written_answer: string | null;
}

export interface OSCEFeedbackRequest {
    case_id: string;
    question: OSCEQuestion;
    student_response: StudentResponse;
}

export interface OSCEFeedbackResponse {
    case_id: string;
    timestamp: string;
    feedback: {
        evaluation_result: string;
        score: number;
        feedback: string;
        grading_rationale: string;
    };
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

export interface OSCEScoreRecord {
    case_id: string;
    overallPerformance: {
        totalPointsEarned: number;
        totalPossiblePoints: number;
        overallPercentage: number;
    };
    performanceByQuestionType: {
        multipleChoicePercentage: number;
        writtenResponsePercentage: number;
        imageBasedPercentage: number;
    };
}

export class OSCEFeedbackService {
    private baseUrl = API_BASE_URL;

    async submitOSCEResponse(
        caseId: string,
        question: OSCEQuestion,
        studentResponse: StudentResponse
    ): Promise<OSCEFeedbackResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/final-osce-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    case_id: caseId,
                    question: question,
                    student_response: studentResponse
                })
            });

            if (!response.ok) {
                handleApiResponse(response);
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to submit OSCE response');
            }

            return response.json();
        } catch (error) {
            console.error('Error submitting OSCE response:', error);
            throw error;
        }
    }

    async recordOsceFeedback(scoreData: OSCEScoreRecord): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/record-osce-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });

            if (!response.ok) {
                handleApiResponse(response);

                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to record OSCE score');
            }

            return response.json();
        } catch (error) {
            console.error('Error recording OSCE score:', error);
            throw error;
        }
    }
} 