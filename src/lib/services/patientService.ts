import type { ApiResponse, Message, PatientResponse } from '$lib/types/index';
import { threadStore } from '$lib/stores/threadStore';
import { API_BASE_URL } from '$lib/config/api';
import { currentCaseId } from '$lib/stores/casePlayerStore';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface PatientRequest {
    case_id: string;
    patient_data: any;
}

export class PatientService {
    private baseUrl = API_BASE_URL;

    async getPatient(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/patient`);
        return response.json();
    }

    async updatePatient(caseId: string, patientData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/patient`, {
            method: 'PUT',
            body: patientData
        });
        return response.json();
    }

    async submitPatient(request: PatientRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/submit-patient`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error submitting patient:', error);
            throw error;
        }
    }
}

export const patientService = new PatientService();

export class PatientApiService {
    private baseUrl = API_BASE_URL;

    async askPatient(query: string): Promise<Message> {
        // Get the current thread_id,case_id from the store
        let currentThreadId: string | null = null;
        let caseId: string | null = null;
        threadStore.subscribe(value => currentThreadId = value)();
        currentCaseId.subscribe(value => caseId = value)();

        const queryParams = new URLSearchParams();
        queryParams.append('student_query', query);
        if (currentThreadId) {
            queryParams.append('thread_id', currentThreadId);
        }
        if (caseId) {
            queryParams.append('case_id', caseId);
        }

        const response = await makeAuthenticatedRequest(`${this.baseUrl}/patient/ask?${queryParams}`);
        const apiResponse: ApiResponse = await response.json();
        const patientResponse: PatientResponse = JSON.parse(apiResponse.response);

        // Store the thread_id for subsequent calls
        threadStore.set(apiResponse.thread_id);

        // Convert the response to your Message format
        return {
            id: patientResponse.id,
            sender: patientResponse.sender.toLowerCase(),
            content: patientResponse.content,
            step: patientResponse.step,
            timestamp: new Date(patientResponse.timestamp),
            type: 'text',
            imageUrl: patientResponse.imageUrl || undefined,
            title: patientResponse.title || undefined
        };
    }
}

export const patientApi = new PatientApiService(); 