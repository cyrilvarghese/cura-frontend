import { API_BASE_URL } from '$lib/config/api';
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
            const response = await fetch(`${this.baseUrl}/student-performance/comparison`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            debugger;
            const data = await response.json();
            return data as StudentPerformanceData[];
        } catch (error) {
            console.error('Failed to fetch student performance data:', error);
            throw error;
        }
    }
}

export const studentPerformanceService = new StudentPerformanceService(); 