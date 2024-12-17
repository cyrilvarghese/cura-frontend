import { API_BASE_URL } from '$lib/config/api';
import type { FormattedPersonaResponse } from '$lib/types';

export class PatientPersonaService {
    private baseUrl = API_BASE_URL;
    
        async createPatientPersona(file: File, caseId: string): Promise<FormattedPersonaResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('case_id', caseId);

        const response = await fetch(
            `${this.baseUrl}/patient_persona/create`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return await response.json();
    }
}

export const patientPersonaService = new PatientPersonaService(); 