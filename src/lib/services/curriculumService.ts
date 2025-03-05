import { API_BASE_URL } from '$lib/config/api';
import type { CurriculumData } from '$lib/types/curriculum';

// For development/testing, we'll use this as mock data
import mockCurriculumData from '../data/mock-curriculum.json';

export class CurriculumService {
    private baseUrl = API_BASE_URL;
    private useMockData = true; // Toggle this for development/production

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getCurriculumData(): Promise<CurriculumData> {
        if (this.useMockData) {
            return mockCurriculumData as CurriculumData;
        }

        try {
            const response = await fetch(`${this.baseUrl}/curriculum`);
            if (!response.ok) {
                throw new Error('Failed to fetch curriculum data');
            }
            const data = await response.json();
            return data as CurriculumData;
        } catch (error) {
            console.error('Error fetching curriculum data:', error);
            throw error;
        }
    }
} 