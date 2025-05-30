import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface TreatmentProtocolRequest {
    case_id: string;
    drug_line: string;
    student_reasoning: string;
    first_line: boolean;
}

export interface AlternativeOption {
    condition: string;
    alternative: string;
    reason?: string;
}

export interface Mechanism {
    label: string;
    how_it_works: string;
    memory_tip?: string;
    what_it_means: string;
}

export interface DrugInClass {
    name: string;
    note: string;
}

export interface DrugDetails {
    name: string;
    class: string;
    alternative_options: AlternativeOption[];
    mechanism: Mechanism;
    monitoring: string;
    other_drugs_in_class: DrugInClass[];
    standard_dose: string;
    teaching_tagline: string;
    why_in_this_case: string;
    dose_adjustment?: string;
    indication?: string;
    contraindications?: string;
    adverse_effects?: string;
    contraindicated_drugs?: string[];
}

export interface TreatmentFeedback {
    match: boolean;
    classification_correct: boolean;
    details: DrugDetails;
    reason: string;
}

export interface TreatmentPlanRequest {
    case_id: string;
    treatment_plan: string[];
}

export interface TreatmentPlanResponse {
    success: boolean;
    message?: string;
    data?: {
        case_id: string;
        treatment_plan: string[];
        timestamp: string;
    };
}

export interface TreatmentProtocolResponse {
    case_id: string;
    timestamp: string;
    feedback: TreatmentFeedback;
    metadata: {
        processing_time_seconds: number;
        model_version: string;
        generation_config: {
            temperature: number;
            top_p: number;
            top_k: number;
        };
    };
    file_path: string;
}

export class TreatmentProtocolService {
    private baseUrl = API_BASE_URL;

    async evaluateTreatmentProtocol(
        caseId: string,
        drugName: string,
        dosage: string,
        indication: string,
        isPrimary: boolean
    ): Promise<TreatmentProtocolResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/treatment_protocol_gemini`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    drug_line: `${drugName} ${dosage}`,
                    student_reasoning: indication,
                    first_line: isPrimary
                }
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate treatment protocol');
            }

            return response.json();
        } catch (error) {
            console.error('Error evaluating treatment protocol:', error);
            throw error;
        }
    }

    async recordTreatmentPlan(
        caseId: string,
        treatmentPlan: string[]
    ): Promise<TreatmentPlanResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/treatment-plan`, {
                method: 'POST',
                body: {
                    case_id: caseId,
                    treatment_plan: treatmentPlan
                }
            });

            if (!response.ok) {
                throw new Error('Failed to record treatment plan');
            }

            return response.json();
        } catch (error) {
            console.error('Error recording treatment plan:', error);
            throw error;
        }
    }
} 