import { API_BASE_URL } from "$lib/config/api";
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockDifferentialDxAnalysis from "$lib/data/feedback-p2.json";

export interface DifferentialDiagnosisFeedback {
    differentialDxAnalysis: {
        differentialListScore: number;
        differentialListExplanation: string;
        detailedAnalysis: Array<{
            dx: string;
            studentDidConsider: boolean;
            isPlausibleDifferential_InContext: boolean;
            reasoningDetail: {
                summaryWhyNotPrimaryOrRuledOut_ForThisCase: string;
                reasonRuledOutFromContext?: string;
                differentiatingHistoryFromContext: Array<{
                    desc: string;
                    comparisonNote: string;
                }>;
                differentiatingLabsFromContext: Array<{
                    testName: string;
                    findingForThisDDx: string;
                    comparisonNote: string;
                }>;
                educationalTip?: string;
            }
        }>;
    };
}

export class DifferentialDiagnosisService {
    private baseUrl = API_BASE_URL;

    async createDifferentialDiagnosis(selectedDocumentName: string, caseId?: string | null) {
        const response = await fetch(`${this.baseUrl}/differential_diagnosis/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_name: selectedDocumentName,
                case_id: caseId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create differential diagnosis from URL');
        }

        return response.json();
    }

    async getDifferentialDiagnosisFeedback(caseId: string): Promise<DifferentialDiagnosisFeedback> {
        // Uncomment to use mock data for testing during development
        // return Promise.resolve(mockDifferentialDxAnalysis as DifferentialDiagnosisFeedback);

        try {
            const response = await fetch(`${this.baseUrl}/feedback/v2/differential-diagnosis`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // You can add query parameters if needed
                // For example: ?case_id=${encodeURIComponent(caseId)}
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get differential diagnosis feedback');
            }

            // Extract the differentialDxAnalysis from inside feedback_result
            const data = await response.json();
            return { differentialDxAnalysis: data.feedback_result.differentialDxAnalysis };
        } catch (error) {
            console.error('Error getting differential diagnosis feedback:', error);
            throw error;
        }
    }
}

export const differentialDiagnosisService = new DifferentialDiagnosisService();