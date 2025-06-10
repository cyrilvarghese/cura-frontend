import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import { handleApiResponse } from "$lib/utils/auth-handler";
import mockStudentPerformanceData from "$lib/data/mock-student-performance.json";

// Define interfaces for the API response
export interface OSCEScoreSummary {
    overallPercentage: number;
    totalPointsEarned: number;
    totalPossiblePoints: number;
}

export interface StudentPerformanceData {
    student_id: string;
    case_id: string;
    primary_diagnosis: string;
    student_history: number;
    student_physicals: number;
    student_tests: number;
    student_diagnosis: number;
    student_reasoning: number;
    student_differentials: number;
    avg_history: number;
    max_history: number;
    avg_physicals: number;
    max_physicals: number;
    avg_tests: number;
    max_tests: number;
    avg_diagnosis: number;
    max_diagnosis: number;
    avg_reasoning: number;
    max_reasoning: number;
    avg_differentials: number;
    max_differentials: number;
    osce_score_summary: OSCEScoreSummary;
    student_osce_percentage: number | null;
    avg_osce_percentage: number | null;
    max_osce_percentage: number | null;
    [key: string]: string | number | OSCEScoreSummary | null; // Index signature
}

export interface PerformanceRequest {
    case_id: string;
    performance_data: any;
}

export class StudentPerformanceService {
    private baseUrl = API_BASE_URL;
    private useMockData = true; // Toggle this to switch between mock and API data

    /**
     * Toggle between mock data and API data
     */
    setUseMockData(useMock: boolean) {
        this.useMockData = useMock;
    }

    /**
     * Fetches student performance comparison data from the API or mock data
     * @returns Promise with student performance data
     */
    async getPerformanceComparison(): Promise<StudentPerformanceData[]> {
        if (this.useMockData) {
            // Return mock data with a slight delay to simulate API call
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockStudentPerformanceData as StudentPerformanceData[]);
                }, 300);
            });
        }

        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/student-performance/comparison`);
            const data = await response.json();
            // Wrap single object in array to maintain existing component logic
            return Array.isArray(data) ? data : [data];
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