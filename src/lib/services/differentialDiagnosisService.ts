import { API_BASE_URL } from "$lib/config/api";

export class DifferentialDiagnosisService {
    private baseUrl = API_BASE_URL;

 

    async createDifferentialDiagnosis(selectedDocumentName: string, caseId?: string | null) {
        const response = await fetch(`${this.baseUrl}/differential_diagnosis/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_name: selectedDocumentName,
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