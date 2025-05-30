import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

// Define the type for the treatment protocol feedback
export type TreatmentProtocolFeedback = {
    student_diagnosis_acknowledged: string;
    student_drug_plan_evaluation: {
        assumed_patient_scenario_from_context: string;
        ideal_drugs_for_this_scenario_from_context: Array<{
            drug_name: string;
            brief_rationale: string;
        }>;
        student_prescribed_drugs_summary: string[];
        appropriateness_of_student_choices_for_scenario: boolean;
        feedback_on_drug_choices: string;
    };
    clinical_implications_of_students_plan: {
        summary: string;
    };
    ideal_drug_therapy_for_learning: {
        diagnosis_context: string;
        treatment_options_by_scenario: Array<{
            scenario: string;
            recommended_drugs: Array<{
                drug_name: string;
                details_brief: string;
                rationale_brief: string;
            }>;
        }>;
        contraindicated_drug_reminders: Array<{
            drug_name: string;
            rationale_brief: string;
        }>;
        critical_adjunctive_therapy_notes: string[];
    };
    key_takeaway_message_on_drug_therapy: string;
};

// Add this interface to match the nested structure
export interface TreatmentFeedbackResponse {
    feedback_result: TreatmentProtocolFeedback;
}

export class TreatmentFeedbackService {
    private baseUrl = API_BASE_URL;

    async getTreatmentFeedback(treatmentPlan: string[]): Promise<TreatmentFeedbackResponse> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/treatment-protocol-feedback/final`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Failed to get treatment protocol feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting treatment protocol feedback:', error);
            throw error;
        }
    }

    // Mock data for development
    private getMockFeedback(treatmentPlan: string[]): TreatmentProtocolFeedback {
        return {
            student_diagnosis_acknowledged: "Urticarial vasculitis",
            student_drug_plan_evaluation: {
                assumed_patient_scenario_from_context: "Urticarial Vasculitis (given joint pain, fatigue, and family history of RA, implying more than just simple urticaria)",
                ideal_drugs_for_this_scenario_from_context: [
                    {
                        drug_name: "Prednisone",
                        brief_rationale: "Key anti-inflammatory to suppress vasculitic inflammation."
                    }
                ],
                student_prescribed_drugs_summary: treatmentPlan,
                appropriateness_of_student_choices_for_scenario: false,
                feedback_on_drug_choices: "Your plan uses Cetirizine for symptomatic itch relief but misses Prednisone, the essential first-line anti-inflammatory treatment for Urticarial Vasculitis."
            },
            clinical_implications_of_students_plan: {
                summary: "Relying solely on Cetirizine would likely lead to uncontrolled vasculitic inflammation, resulting in persistent skin lesions, ongoing joint pain, and fatigue, as the underlying disease process is not addressed."
            },
            ideal_drug_therapy_for_learning: {
                diagnosis_context: "Urticarial Vasculitis",
                treatment_options_by_scenario: [
                    {
                        scenario: "First-Line Therapy",
                        recommended_drugs: [
                            { drug_name: "Prednisone", details_brief: "20-40 mg/day (tapered)", rationale_brief: "Suppresses inflammation in Urticarial Vasculitis." }
                        ]
                    },
                    {
                        scenario: "Second-Line/Alternative Therapy",
                        recommended_drugs: [
                            { drug_name: "Hydroxychloroquine", details_brief: "Dosage as per guidelines", rationale_brief: "Considered for autoimmune overlap or as a steroid-sparing agent." },
                            { drug_name: "Methotrexate", details_brief: "Dosage as per guidelines", rationale_brief: "Option for severe cases or as a steroid-sparing agent." }
                        ]
                    }
                ],
                contraindicated_drug_reminders: [
                    { drug_name: "Empiric antihistamines alone", rationale_brief: "Inadequate for treating vasculitis; only manages symptoms." },
                    { drug_name: "Long-term NSAIDs without GI protection", rationale_brief: "Risk of gastritis/ulcers; does not treat underlying vasculitis." }
                ],
                critical_adjunctive_therapy_notes: [
                    "Educate patient on chronic nature and signs of flare.",
                    "Emphasize adherence to tapering schedule for corticosteroids.",
                    "Counsel on potential steroid side effects.",
                    "Regular follow-up with rheumatology if systemic signs develop."
                ]
            },
            key_takeaway_message_on_drug_therapy: "For Urticarial Vasculitis, prioritize systemic anti-inflammatory agents like Prednisone to target the underlying inflammation, rather than relying solely on symptomatic treatments like antihistamines."
        };
    }
}

export const treatmentFeedbackService = new TreatmentFeedbackService(); 