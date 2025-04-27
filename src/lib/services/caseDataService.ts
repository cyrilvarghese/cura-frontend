import { API_BASE_URL } from '$lib/config/api';
import type { CaseStoreState, ClinicalFindingsContextResponse } from '$lib/types/caseTypes';
import type { CaseData } from '$lib/stores/casePlayerStore';
import type { FormattedPersonaResponse } from '$lib/types/index';
import { handleApiResponse } from '$lib/utils/auth-handler';
import type { HistoryContextResponse } from '$lib/services/historyContextService';
import type { TreatmentContextResponse } from './treatmentContextService';

export interface CaseListItem {
    case_id: number;
    case_name: string;
    title: string;
    quote: string;
    image_url: string;
    department: string;
    published: boolean;
    deleted: boolean;
}

export interface PublishCaseParams {
    published: boolean;
}

interface CaseDetailsResponse {
    content: {
        case_cover: {
            case_name: string;
            case_id: number;
            title: string;
            quote: string;
            image_url: string;
            image_prompt: string;
            differentials: any[];
            last_updated: string;
            department: string;
            published: boolean;
            google_doc_link: string;
            doc_has_changed: boolean;
        };
        test_data: {
            physical_exam: any;
            lab_test: any;
        };
        patient_persona: FormattedPersonaResponse;
        history_context?: HistoryContextResponse;
        treatment_context: TreatmentContextResponse;
        clinical_findings_context?: ClinicalFindingsContextResponse;
    };
}

export class CaseDataService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getCaseData(caseId: string): Promise<CaseData> {
        const response = await fetch(`${this.baseUrl}/cases/${caseId}`);
        const data = await response.json();
        await handleApiResponse(response);
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
                await handleApiResponse(response);
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

    async getCaseById(id: string): Promise<CaseStoreState> {
        const response = await fetch(`${this.baseUrl}/case-details/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch case data');
        }

        const data: CaseDetailsResponse = await response.json();

        // Transform the API response to match the store structure
        return {
            caseId: data.content.case_cover.case_id.toString(),
            persona: data.content.patient_persona,
            testData: {
                physical_exam: data.content.test_data.physical_exam,
                lab_test: data.content.test_data.lab_test
            },
            coverImage: {
                image_url: data.content.case_cover.image_url,
                prompt: data.content.case_cover.image_prompt,
                title: data.content.case_cover.title,
                quote: data.content.case_cover.quote
            },
            differentialDiagnosis: data.content.case_cover.differentials,
            historyContext: data.content.history_context || null,
            generating: false,
            error: null,
            loading: false,
            uploadedFile: null,
            uploadedFileName: data.content.case_cover.case_name,
            isGeneratingPersona: false,
            isGeneratingPhysicalExam: false,
            isGeneratingDifferential: false,
            isGeneratingHistoryContext: false,
            isSearchingImages: false,
            searchedImages: null,
            selectedDocumentName: data.content.case_cover.case_name,
            googleDocLink: data.content.case_cover.google_doc_link,
            doc_has_changed: data.content.case_cover.doc_has_changed,
            treatmentContext: data.content.treatment_context,
            isGeneratingTreatmentContext: false,
            clinicalFindingsContext: data.content.clinical_findings_context || null,
            isGeneratingClinicalFindingsContext: false,
        };
    }
} 