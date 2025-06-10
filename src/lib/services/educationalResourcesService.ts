import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import mockEducationalCapsules from "$lib/data/feedback-p3.json";

export interface EducationalResourcesFeedback {
    educationalCapsules: {
        primaryDxCapsule: {
            dx: string;
            overview: string;
            pathoPoints: string[];
            etiologyRiskFactors: string[];
            clinicalFeatures: string[];
            complications: string[];
            diagModalities: string[];
        };
        differentialDxCapsulesToEmbed: Array<{
            differentialDxName: string;
            overview: string;
            pathoPoints: string[];
            etiologyRiskFactors: string[];
            clinicalFeatures: string[];
            diagModalities: string[];
        }>;
    };
}

export interface EducationalResourcesRequest {
    case_id: string;
    resources: string[];
}

export class EducationalResourcesService {
    private baseUrl = API_BASE_URL;

    async getEducationalResources(caseId: string): Promise<EducationalResourcesFeedback> {
        // Uncomment to use mock data for testing during development
        // return Promise.resolve(mockEducationalCapsules as EducationalResourcesFeedback);

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/feedback/v2/educational-resources`);
            const data = await response.json();
            return { educationalCapsules: data.feedback_result.educationalCapsules };
        } catch (error) {
            console.error('Error getting educational resources:', error);
            throw error;
        }
    }

}

export const educationalResourcesService = new EducationalResourcesService(); 