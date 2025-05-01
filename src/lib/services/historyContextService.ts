import { API_BASE_URL } from '$lib/config/api';

export interface HistoryContextResponse {
    case_id: number;
    content: {
        case_summary_history: {
            chief_complaint: string;
            history_of_present_illness?: string;
            demographics_risk: {
                age: number | null;
                gender: string;
                occupation?: string;
                sexual_orientation?: string;
                hiv_status?: string;
                art_status?: string;
                risk_factors?: string | string[];
            };
            history_timeline?: Record<string, string>;
            associated_symptoms: Record<string, string> | string[] | null;
            pertinent_positives: string[] | null;
            pertinent_positives_from_history?: string[];
            pertinent_negatives_from_history: string[] | null;
            social_history?: Record<string, string> | string;
            past_medical_history?: string | null;
            family_history?: string | null;
            medications_allergies?: string | null;
        };
        expected_questions_with_domains: Array<{
            question: string;
            domain: string;
        }>;
    };
    file_path: string;
    timestamp: string;
    type: string;
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