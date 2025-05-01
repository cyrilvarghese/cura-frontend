// Define shared types used across multiple modules
import type { DiagnosisContextResponse } from '$lib/services/diagnosisContextService';

// export interface ClinicalFindingsContextResponse {
//     id?: string;
//     content: {
//         critical_findings: string[];
//         additional_observations?: string[];
//         recommended_actions?: string[];
//         clinical_significance?: string;
//     };
//     case_id: string | number;
//     file_path?: string;
//     timestamp?: string;
//     type?: string;
// }

export interface CaseStoreState {
    caseId: string | null;
    loading: boolean;
    generating: boolean;
    error: string | null;
    persona: any; // Adjust to use proper type
    testData: {
        physical_exam: any;
        lab_test: any;
    } | null;
    coverImage: any; // Adjust to use proper type
    differentialDiagnosis: any | null;
    diagnosisContext: DiagnosisContextResponse | null;
    historyContext: any | null; // Adjust to use proper type
    treatmentContext: any | null; // Adjust to use proper type
    clinicalFindingsContext: ClinicalFindingsContextResponse | null;
    uploadedFile: File | null;
    uploadedFileName: string | null;
    isGeneratingPersona: boolean;
    isGeneratingPhysicalExam: boolean;
    isGeneratingDifferential: boolean;
    isGeneratingHistoryContext: boolean;
    isGeneratingTreatmentContext: boolean;
    isGeneratingClinicalFindingsContext: boolean;
    searchedImages: any | null; // Adjust to use proper type
    isSearchingImages: boolean;
    selectedDocumentName: string | null;
    googleDocLink: string | null;
    doc_has_changed: boolean;
} 