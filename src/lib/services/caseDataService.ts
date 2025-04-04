import { API_BASE_URL } from '$lib/config/api';
import type { CaseData } from '$lib/stores/casePlayerStore';

export interface CaseListItem {
    case_id: number;
    case_name: string;
    title: string;
    quote: string;
    image_url: string;
    department: string;
    published: boolean;
}

export interface PublishCaseParams {
    published: boolean;
}

export class CaseDataService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getCaseData(caseId: string): Promise<CaseData> {
        const response = await fetch(`${this.baseUrl}/cases/${caseId}`);
        const data = await response.json();

        return {
            physicalExamReports: data.content.physical_exam,
            labTestReports: data.content.lab_test,
            coverMessage: data.content.case_cover,
        };
    }

    async getAllCases(): Promise<CaseListItem[]> {
        try {
            const response = await fetch(`${this.baseUrl}/cases`);
            if (!response.ok) {
                throw new Error('Failed to fetch cases');
            }
            const data = await response.json();
            return data as CaseListItem[];
        } catch (error) {
            console.error('Error fetching all cases:', error);
            throw error;
        }
    }

    async getDocumentsByTopic(topicName: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/curriculum/topics/${topicName}/documents`);
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        return response.json();
    }

    async publishCase(caseId: string, params: PublishCaseParams): Promise<any> {
        debugger;
        try {
            const response = await fetch(`${this.baseUrl}/cases/${caseId}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error('Failed to publish case');
            }

            return response.json();
        } catch (error) {
            console.error('Error publishing case:', error);
            throw error;
        }
    }
} 