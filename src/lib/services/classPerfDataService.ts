import { API_BASE_URL } from '$lib/config/api';
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockTeachingData from "$lib/data/mock-teaching.json";
import { authStore } from '$lib/stores/authStore';
import { get } from 'svelte/store';

// Define interfaces for the API response
export interface CaseSessionData {
    session_id: string;
    student_id: string;
    student_name: string;
    department: string;
    case_id: string;
    session_start: string;
    session_end: string;
    history_taking: number;
    physical_exams: number;
    test_ordering: number;
    diagnosis_accuracy: number;
    reasoning: number;
    primary_diagnosis: string;
    differentials: number;
    [key: string]: string | number; // Index signature
}

export class TeachingService {
    private baseUrl = API_BASE_URL;

    /**
     * Fetches teaching session data for a specific department
     * @param department Department name to filter sessions
     * @returns Promise with teaching session data
     */
    async getTeachingSessions(department: string): Promise<CaseSessionData[]> {
        // Temporarily return mock data for development
        // return Promise.resolve(mockTeachingData as TeachingSessionData[]);
        debugger;
        try {
            const response = await fetch(`${this.baseUrl}/teaching?department=${encodeURIComponent(department)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${get(authStore).accessToken}`,
                    "X-Refresh-Token": get(authStore).refreshToken
                },
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data as CaseSessionData[];
        } catch (error) {
            console.error('Failed to fetch teaching data:', error);
            throw error;
        }
    }
}

export const teachingService = new TeachingService(); 