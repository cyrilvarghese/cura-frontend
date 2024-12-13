import { API_BASE_URL } from '$lib/config/api';

export interface CaseData {
    physicalExamReports: any; // Replace 'any' with the appropriate type if known
    labTestReports: any; // Replace 'any' with the appropriate type if known
    coverMessage: string; // Assuming coverMessage is a string
}

export class CaseDataService {
    private baseUrl = API_BASE_URL;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

 

    async getCaseData(caseId: string): Promise<CaseData> {
        const response = await fetch(`${this.baseUrl}/cases/${caseId}`);
        const data = await response.json();
        debugger;
        // Extracting specific keys from the response
        return {
            physicalExamReports: data.content.physical_exam,
            labTestReports: data.content.lab_test,
            coverMessage: data.content.cover_message,
        };
    }
} 