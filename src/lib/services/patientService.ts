import type { ApiResponse, Message, PatientResponse } from '$lib/types';
import { threadStore } from '$lib/stores/threadStore';
import { API_BASE_URL } from '$lib/config/api';
import { currentCaseId } from '$lib/stores/casePlayerStore';

export class PatientApiService {
    private baseUrl = API_BASE_URL;

    async askPatient(query: string): Promise<Message> {
        // Get the current thread_id,case_id from the store
        let currentThreadId: string | null = null;
        let caseId: string | null = null;
        threadStore.subscribe(value => currentThreadId = value)();
        currentCaseId.subscribe(value => caseId = value)();

        const response = await fetch(
            `${this.baseUrl}/patient/ask?student_query=${encodeURIComponent(query)}${currentThreadId ? `&thread_id=${currentThreadId}` : ''}${caseId ? `&case_id=${caseId}` : ''}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get patient response');
        }

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