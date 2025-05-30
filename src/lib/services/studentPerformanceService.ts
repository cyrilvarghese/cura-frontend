import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockStudentData from "$lib/data/mock-student.json";

// Define interfaces for the API response
export interface StudentPerformanceData {
    primary_diagnosis: string;
    student_differential: string;
    avg_differential: number;
    max_differential: number;
    student_history: string;
    avg_history: number;
    max_history: number;
    student_physical: string;
    avg_physical: number;
    max_physical: number;
    student_lab: string;
    avg_lab: number;
    max_lab: number;
    student_management: string;
    avg_management: number;
    max_management: number;
    [key: string]: string | number; // Index signature
}

export interface PerformanceRequest {
    case_id: string;
    performance_data: any;
}

export class StudentPerformanceService {
    private baseUrl = API_BASE_URL;

    /**
     * Fetches student performance comparison data from the API
     * @returns Promise with student performance data
     */
    async getPerformanceComparison(): Promise<StudentPerformanceData[]> {
        // Temporarily return mock data
        // return Promise.resolve(mockStudentData as StudentPerformanceData[]);

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/student-performance/comparison`);
            return response.json();
        } catch (error) {
            console.error('Failed to fetch student performance data:', error);
            throw error;
        }
    }

    async getPerformance(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/performance`);
        return response.json();
    }

    async updatePerformance(caseId: string, performanceData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/performance`, {
            method: 'PUT',
            body: performanceData
        });
        return response.json();
    }

    async submitPerformance(request: PerformanceRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-performance`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting performance:', error);
            throw error;
        }
    }
}

export const studentPerformanceService = new StudentPerformanceService(); 