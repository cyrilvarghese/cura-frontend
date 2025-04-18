import { API_BASE_URL } from '$lib/config/api';
import type { FormattedPersonaResponse } from '$lib/types/index';

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

    async createPatientPersonaFromUrl(selectedDocumentName: string, caseId: string | null, department: string, googleDocLink: string | null): Promise<FormattedPersonaResponse> {
        debugger;
        console.log(googleDocLink);
        const response = await fetch(
            `${this.baseUrl}/patient_persona/create`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_name: selectedDocumentName,
                    case_id: caseId,
                    department: department,
                    google_doc_link: googleDocLink
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create persona from URL');
        }

        return await response.json();
    }
}

export const patientPersonaService = new PatientPersonaService(); 