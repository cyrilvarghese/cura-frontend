import { API_BASE_URL } from "$lib/config/api";
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockDifferentialDxAnalysis from "$lib/data/feedback-p2.json";
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface DifferentialDiagnosisFeedback {
    differentialDxAnalysis: {
        differentialListScore: string;
        differentialListExplanation: string;
        detailedAnalysis: Array<{
            type: "PrimaryDiagnosis" | "PlausibleDifferential" | "RuledOutDifferential";
            dxName: string;
            supportingFeatures_ThisCase?: {
                history: string[];
                exam: string[];
                lab: string[];
            };
            studentDidConsiderAsPlausible?: boolean;
            studentDidMarkAsIncorrect?: boolean | null;
            differentiatingFeatures_General?: {
                history: string[];
                exam: string[];
                lab: string[];
            };
            caseSpecificDifferentiation?: {
                quickDifferentiatingTags_ThisCase: string[];
                detailedExplanation_ThisCase: string;
                educationalTip: string | null;
            };
            educationalTip?: string | null;
        }>;
    };
}

export interface DifferentialDiagnosisRequest {
    case_id: string;
    differentials: string[];
}

export class DifferentialDiagnosisService {
    private baseUrl = API_BASE_URL;

    async createDifferentialDiagnosis(selectedDocumentName: string, caseId?: string | null) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/differential_diagnosis/create`, {
            method: 'POST',
            body: {
                file_name: selectedDocumentName,
                case_id: caseId
            }
        });
        return response.json();
    }

    async getDifferentialDiagnosisFeedback(caseId: string): Promise<DifferentialDiagnosisFeedback> {
        // Uncomment to use mock data for testing during development
        // return Promise.resolve(mockDifferentialDxAnalysis as DifferentialDiagnosisFeedback);

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/v2/differential-diagnosis`);
            const data = await response.json();
            return { differentialDxAnalysis: data.feedback_result.differentialDxAnalysis };
        } catch (error) {
            console.error('Error getting differential diagnosis feedback:', error);
            throw error;
        }
    }

    async getDifferentialDiagnosis(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/differential-diagnosis`);
        return response.json();
    }

    async updateDifferentialDiagnosis(caseId: string, diagnosisData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/differential-diagnosis`, {
            method: 'PUT',
            body: diagnosisData
        });
        return response.json();
    }

    async recordDifferentialDiagnosis(request: DifferentialDiagnosisRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/record-differential-diagnosis`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error recording differential diagnosis:', error);
            throw error;
        }
    }
}

export const differentialDiagnosisService = new DifferentialDiagnosisService();