import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface TreatmentMonitoringRequest {
    case_id: string;
    pre_treatment_checks: string[];
    post_treatment_monitoring: string[];
}

export interface TreatmentMonitoringResponse {
    success: boolean;
    message?: string;
    data?: {
        case_id: string;
        pre_treatment_checks: string[];
        post_treatment_monitoring: string[];
    };
}

export interface Investigation {
    name: string;
}

export interface MonitoringPlan {
    timePoint: string;
    test: string;
    fullText: string;
}

export interface TestFeedback {
    match: boolean;
    specific: string;
    general: string;
    lateral: string;
}

export class TreatmentMonitoringService {
    private baseUrl = API_BASE_URL;

    async recordTreatmentMonitoring(
        caseId: string,
        preTreatmentChecks: string[],
        postTreatmentMonitoring: string[]
    ): Promise<TreatmentMonitoringResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/treatment-monitoring`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    pre_treatment_checks: preTreatmentChecks,
                    post_treatment_monitoring: postTreatmentMonitoring
                }
            });

            if (!response.ok) {
                throw new Error('Failed to record treatment monitoring');
            }

            return response.json();
        } catch (error) {
            console.error('Error recording treatment monitoring:', error);
            throw error;
        }
    }

    // Keep the existing evaluation methods from preTreatmentService
    async evaluatePreTreatment(tests: string[]): Promise<{ feedback: Record<string, TestFeedback> }> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/evaluate-pre-treatment`, {
                method: 'POST',
                body: { tests }
            });
            return response.json();
        } catch (error) {
            console.error('Error evaluating pre-treatment:', error);
            throw error;
        }
    }

    async evaluateMonitoring(monitoring: string[]): Promise<Record<string, TestFeedback>> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/evaluate-monitoring`, {
                method: 'POST',
                body: { monitoring }
            });
            return response.json();
        } catch (error) {
            console.error('Error evaluating monitoring:', error);
            throw error;
        }
    }
} 