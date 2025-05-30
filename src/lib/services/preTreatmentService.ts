import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface PreTreatmentRequest {
    case_id: number;
    student_inputs_pre_treatment: string[];
    student_inputs_monitoring: string[];
}

export interface TestFeedback {
    match: boolean | "NA";
    specific: string;
    general: string;
    lateral: string;
}

export interface PreTreatmentResponse {
    case_id: number;
    timestamp: string;
    feedback: {
        [testName: string]: TestFeedback;
    };
    metadata: {
        total_tests_evaluated: number;
        processing_time_seconds: number;
        model_version: string;
    };
    file_path: string;
}

export interface MonitoringResponse {
    case_id: number;
    timestamp: string;
    feedback: {
        [testName: string]: TestFeedback;
    };
    metadata: {
        total_tests_evaluated: number;
        processing_time_seconds: number;
        model_version: string;
    };
    file_path: string;
}

export class PreTreatmentService {
    private baseUrl = API_BASE_URL;

    async evaluatePreTreatment(input: string[], caseId: string): Promise<PreTreatmentResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/pre_treatment_gemini`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    student_inputs_pre_treatment: input,
                    student_inputs_monitoring: []
                }
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate pre-treatment');
            }

            return response.json();
        } catch (error) {
            console.error('Error evaluating pre-treatment:', error);
            throw error;
        }
    }

    async evaluateMonitoring(monitoringInputs: string[], caseId: string): Promise<MonitoringResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/monitoring_gemini`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    student_inputs_pre_treatment: [],
                    student_inputs_monitoring: monitoringInputs
                }
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate monitoring');
            }

            return response.json();
        } catch (error) {
            console.error('Error evaluating monitoring:', error);
            throw error;
        }
    }
}