import { API_BASE_URL } from '$lib/config/api';

export interface HistoryContextResponse {
    id: string;
    content: {
        case_summary_history: {
            chief_complaint: string;
            demographics_risk: {
                age: number;
                gender: string;
                sexual_orientation: string;
                risk_factors: string;
            };
            history_timeline: Record<string, string>;
            associated_symptoms: string[];
            pertinent_positives: string[];
            pertinent_negatives_from_history: string[];
        };
        expected_questions: string[];
    };
    case_id: string;
    file_path?: string;
    timestamp?: string;
    type?: string;
}

export class HistoryContextService {
    private baseUrl = API_BASE_URL;

    async createHistoryContext(fileName: string, caseId: string): Promise<HistoryContextResponse> {
        const response = await fetch(
            `${this.baseUrl}/history_context/create`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_name: fileName,
                    case_id: caseId
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create history context summary');
        }

        return await response.json();
    }
}

export const historyContextService = new HistoryContextService(); 