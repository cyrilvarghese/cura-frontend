import { API_BASE_URL } from "$lib/config/api";

export class DifferentialDiagnosisService {
    private baseUrl = API_BASE_URL;

    async createDifferentialDiagnosis(caseId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('case_id', caseId.toString());

        const response = await fetch(`${this.baseUrl}/differential_diagnosis/create`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }

    async createDifferentialDiagnosisFromUrl(fileUrl: string, caseId?: string | null) {
        const response = await fetch(`${this.baseUrl}/differential_diagnosis/create-from-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_url: fileUrl,
                case_id: caseId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create differential diagnosis from URL');
        }

        return response.json();
    }
}

export const differentialDiagnosisService = new DifferentialDiagnosisService();