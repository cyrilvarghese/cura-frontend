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

export interface PerformanceComparisonData {
    student_id: string;
    case_id: string;
    primary_diagnosis: string;
    student_history: number;
    student_physicals: number;
    student_tests: number;
    student_diagnosis: number;
    student_reasoning: number;
    student_differentials: number;
    avg_history: number;
    max_history: number;
    avg_physicals: number;
    max_physicals: number;
    avg_tests: number;
    max_tests: number;
    avg_diagnosis: number;
    max_diagnosis: number;
    avg_reasoning: number;
    max_reasoning: number;
    avg_differentials: number;
    max_differentials: number;
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

    async getPerformanceComparison(caseId: string): Promise<PerformanceComparisonData> {
        try {
            console.log(`OSCEFeedbackService: Fetching performance comparison for case ID: ${caseId}`);
            const url = `${this.baseUrl}/student-performance/comparison/${caseId}`;
            console.log(`OSCEFeedbackService: API URL: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`OSCEFeedbackService: API response status: ${response.status}`);

            if (!response.ok) {
                handleApiResponse(response);
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || 'Failed to fetch performance comparison data');
            }

            const data = await response.json();
            console.log('OSCEFeedbackService: Comparison data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching performance comparison data:', error);
            throw error;
        }
    }
} 