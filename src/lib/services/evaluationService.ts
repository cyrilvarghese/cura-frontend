import { API_BASE_URL } from '$lib/config/api';

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

export class EvaluationService {
    private baseUrl = API_BASE_URL;

    async evaluateFindings(findings: string[], caseId: string): Promise<EvaluationResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/evaluate-findings-gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    findings,
                    case_id: caseId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate findings');
            }

            return response.json();
        } catch (error) {
            console.error('Error evaluating findings:', error);
            throw error;
        }
    }
} 