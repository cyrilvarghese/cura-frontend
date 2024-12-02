import type { Message } from '$lib/types';

export class PatientApiService {
    private baseUrl = 'http://127.0.0.1:8000';

    async askPatient(query: string): Promise<Message> {
        const response = await fetch(
            `${this.baseUrl}/patient/ask?student_query=${encodeURIComponent(query)}`,
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

        return response.json();
    }
}

export const patientApi = new PatientApiService(); 