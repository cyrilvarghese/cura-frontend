import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from "$lib/utils/auth-handler";
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

export class EducationalResourcesService {
    private baseUrl = API_BASE_URL;

    async getEducationalResources(caseId: string): Promise<EducationalResourcesFeedback> {
        // Uncomment to use mock data for testing during development
        // return Promise.resolve(mockEducationalCapsules as EducationalResourcesFeedback);

        try {
            const response = await fetch(`${this.baseUrl}/feedback/v2/educational-resources`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // You can add query parameters if needed
                // For example: ?case_id=${encodeURIComponent(caseId)}
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error('Failed to get educational resources');
            }

            // Extract the educationalCapsules from inside feedback_result
            const data = await response.json();
            return { educationalCapsules: data.feedback_result.educationalCapsules };
        } catch (error) {
            console.error('Error getting educational resources:', error);
            throw error;
        }
    }
}

export const educationalResourcesService = new EducationalResourcesService(); 