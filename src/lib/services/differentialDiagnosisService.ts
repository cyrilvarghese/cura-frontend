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
} 

export const differentialDiagnosisService = new DifferentialDiagnosisService();