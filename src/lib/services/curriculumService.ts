import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import type { CurriculumData } from '$lib/types/curriculum';

// For development/testing, we'll use this as mock data
import mockCurriculumData from '../data/mock-curriculum.json';

export class CurriculumService {
    private baseUrl = API_BASE_URL;
    private useMockData = false; // Toggle this for development/production

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getCurriculumData(): Promise<CurriculumData> {
        if (this.useMockData) {
            return mockCurriculumData as CurriculumData;
        }

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/curriculum`);
            const data = await response.json();
            return data as CurriculumData;
        } catch (error) {
            console.error('Error fetching curriculum data:', error);
            throw error;
        }
    }

    async getTopics(): Promise<any[]> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/curriculum/topics`);
        return response.json();
    }

    async getDocumentsByTopic(topicName: string): Promise<any[]> {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/curriculum/topics/${topicName}/documents`);
        return response.json();
    }
}

export const curriculumService = new CurriculumService(); 