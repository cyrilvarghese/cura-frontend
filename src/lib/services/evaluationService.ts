import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface Finding {
    findings: string[];
}

export interface ComparativeAnalysis {
    important_finding: string;
    status: string;
    student_match: string;
    justification: string;
}

export interface MissingFinding {
    finding: string;
    reason: string;
}

export interface EvaluationResponse {
    feedback: {
        missing_findings: MissingFinding[];
        message: string;
    };
    statistics: {
        completion_percentage: number;
        found_findings: number;
        missed_findings: number;
        total_findings: number;
    };
    timestamp: string;
    case_id: string;
}

export interface SingleFindingEvaluation {
    finding: string;
    evaluation: {
        match: boolean;
        message: string;
        matched_finding?: string;
    };
    timestamp: string;
    case_id: string;
    metadata: Record<string, any>;
}

export interface EvaluationRequest {
    case_id: string;
    evaluation_data: any;
}

export class EvaluationService {
    private baseUrl = API_BASE_URL;

    async getEvaluation(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/evaluation`);
        return response.json();
    }

    async updateEvaluation(caseId: string, evaluationData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/evaluation`, {
            method: 'PUT',
            body: evaluationData
        });
        return response.json();
    }

    async submitEvaluation(request: EvaluationRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-evaluation`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            throw error;
        }
    }

    async evaluateFindings(findings: string[], caseId: string): Promise<EvaluationResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/evaluate-findings-gemini`, {
                method: 'POST',
                body: {
                    findings,
                    case_id: caseId
                }
            });
            return response.json();
        } catch (error) {
            console.error('Error evaluating findings:', error);
            throw error;
        }
    }

    async evaluateSingleFinding(finding: string, caseId: string): Promise<SingleFindingEvaluation> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/evaluate-single-finding`, {
                method: 'POST',
                body: {
                    finding,
                    case_id: caseId
                }
            });
            return response.json();
        } catch (error) {
            console.error('Error evaluating single finding:', error);
            throw error;
        }
    }
}

export const evaluationService = new EvaluationService(); 