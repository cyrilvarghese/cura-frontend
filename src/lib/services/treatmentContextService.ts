import { API_BASE_URL } from '$lib/config/api';

export interface TreatmentContextResponse {
    id?: string;
    content: {
        patient_summary: {
            age: number;
            gender: string;
            diagnosis: string;
            critical_factors: string[];
        };
        pre_treatment_investigations: {
            test_name: string;
            purpose: string;
            relevant_drugs: string[];
        }[];
        monitoring_during_treatment: {
            parameter_to_monitor: string;
            frequency_timing: string;
            purpose: string;
            relevant_drugs: string[];
        }[];
        treatment_plan: {
            first_line: {
                drug_name: string;
                details: string;
                rationale: string | null;
            }[];
            escalation: {
                drug_name: string;
                details: string;
                rationale: string | null;
            }[];
            contraindicated: {
                drug_name: string;
                details: string;
                rationale: string | null;
            }[];
        };
        additional_notes: string[];
    };
    case_id: string | number;
    file_path?: string;
    timestamp?: string;
    type?: string;
}

export class TreatmentContextService {
    private baseUrl = API_BASE_URL;

    async createTreatmentContext(fileName: string, caseId: string): Promise<TreatmentContextResponse> {
        const response = await fetch(
            `${this.baseUrl}/treatment_context/create`,
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
            throw new Error('Failed to create treatment context');
        }

        return await response.json();
    }
}

export const treatmentContextService = new TreatmentContextService(); 