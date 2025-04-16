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

    async evaluateSingleFinding(finding: string, caseId: string): Promise<SingleFindingEvaluation> {
        try {
            const response = await fetch(`${this.baseUrl}/evaluate-single-finding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    finding,
                    case_id: caseId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate single finding');
            }

            return response.json();
        } catch (error) {
            console.error('Error evaluating single finding:', error);
            throw error;
        }
    }
} 