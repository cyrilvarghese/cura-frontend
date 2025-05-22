import { API_BASE_URL } from '$lib/config/api';

export interface PhysicalExam {
    name: string;
    purpose: string;
    generalDescription: string;
    educationalTip: string | null;
}

export interface DiagnosticTest {
    name: string;
    purpose: string;
    generalDescription: string;
    educationalTip: string | null;
}

export interface DiagnosisDifferential {
    name: string;
    primaryDifferentiator: string;
    educationalTip: string | null;
}

export interface DiagnosisContextResponse {
    id?: string;

    physical_exam: any;
    lab_test: any;
    case_cover: any;
    primaryDiagnosis: string;
    keyEvidence: string[];
    essentialPhysicalExams: PhysicalExam[];
    keyDiagnosticTests: DiagnosticTest[];
    plausibleDifferentials: DiagnosisDifferential[];
    ruledOutDifferentials: DiagnosisDifferential[];

    case_id: string | number;
    file_path?: string;
    timestamp?: string;
    type?: string;
}

export class DiagnosisContextService {
    private baseUrl = API_BASE_URL;

    async createDiagnosisContext(fileName: string, caseId: string): Promise<DiagnosisContextResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/diagnosis_context/create`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        file_name: fileName,
                        case_id: caseId
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create diagnosis context');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating diagnosis context:', error);
            throw error;
        }
    }
}

export const diagnosisContextService = new DiagnosisContextService(); 