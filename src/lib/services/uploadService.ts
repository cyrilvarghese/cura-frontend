import { API_BASE_URL } from '$lib/config/api';
import type { FormattedPersonaResponse } from '$lib/types';

export class FileUploadService {
    private baseUrl = API_BASE_URL;
    
    async uploadFile(file: File, caseId: string): Promise<FormattedPersonaResponse> {
        const formData = new FormData();
        formData.append('pdf_file', file);
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

export const uploadService = new FileUploadService(); 