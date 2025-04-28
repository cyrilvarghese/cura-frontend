import { writable, get } from 'svelte/store';
import { patientPersonaService } from '$lib/services/patientPersonaService'; // Adjust the import based on your project structure
import { testDataService } from '$lib/services/testDataService'; // Adjust the import based on your project structure

import { coverImageService } from '$lib/services/coverImageService';
import { differentialDiagnosisService } from '$lib/services/differentialDiagnosisService';
import { diagnosisContextService } from '$lib/services/diagnosisContextService';
import { imageSearchService } from '$lib/services/imageSearchService';
import { currentDepartment } from './teamStore';
import { CaseDataService } from '$lib/services/caseDataService';
import { historyContextService } from '$lib/services/historyContextService';
import { treatmentContextService } from '$lib/services/treatmentContextService';
import type { CaseStoreState } from '$lib/types/caseTypes';
import { ClinicalFindingsService } from '$lib/services/clinicalFindingsService';

// Use a lazy initialization pattern instead of immediate initialization
let _caseDataService: CaseDataService | null = null;
function getCaseDataService(): CaseDataService {
    if (!_caseDataService) {
        _caseDataService = new CaseDataService();
    }
    return _caseDataService;
}

// After lazy initialization of CaseDataService
let _clinicalFindingsService: ClinicalFindingsService | null = null;
function getClinicalFindingsService(): ClinicalFindingsService {
    if (!_clinicalFindingsService) {
        _clinicalFindingsService = new ClinicalFindingsService();
    }
    return _clinicalFindingsService;
}

// Create a writable store with initial state
const initialState: CaseStoreState = {
    loading: false,
    generating: false,
    error: null,
    persona: null,
    testData: null,
    coverImage: null,
    differentialDiagnosis: null,
    diagnosisContext: null,
    historyContext: null,
    treatmentContext: null,
    clinicalFindingsContext: null,
    caseId: null,
    uploadedFile: null,
    uploadedFileName: null,
    isGeneratingPersona: false,
    isGeneratingPhysicalExam: false,
    isGeneratingDifferential: false,
    isGeneratingHistoryContext: false,
    isGeneratingTreatmentContext: false,
    isGeneratingClinicalFindingsContext: false,
    searchedImages: null,
    isSearchingImages: false,
    selectedDocumentName: null,
    googleDocLink: null,
    doc_has_changed: false,
};

export const caseStore = writable<CaseStoreState>(initialState);
export const lastCaseIdStore = writable<string | null>(null);

// Function to update case ID
export function updateCaseId(caseId: string) {
    //make sure its strigyfied if its a number
    caseId = caseId.toString();
    caseStore.update(state => ({
        ...state,
        caseId
    }));
    lastCaseIdStore.set(caseId);
}

// Function to update uploaded file
export function updateUploadedFile(file: File) {
    caseStore.update(state => ({
        ...state,
        uploadedFile: file,
        uploadedFileName: file.name,
        fileUploaded: true
    }));
}

// Function to reset store
export function resetStore() {
    caseStore.set(initialState);
    lastCaseIdStore.set(null);
}

export async function generateCoverImage(caseId: string) {
    caseStore.update(state => ({ ...state, generating: true, error: null }));

    try {
        const response = await coverImageService.createCoverImage(caseId);
        caseStore.update(state => ({
            ...state,
            coverImage: {
                image_url: response.image_url,
                timestamp: new Date().toISOString(),
                type: "ai",
                prompt: response.prompt,
                title: response.title,
                quote: response.quote,
            },
            generating: false,
        }));
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Cover image generation failed",
            generating: false,
        }));
    }
}

// Function to search medical images
export async function searchMedicalImages(query: string) {
    caseStore.update(state => ({ ...state, isSearchingImages: true, error: null }));

    try {
        const response = await imageSearchService.searchMedicalImages(query);
        console.log('Image search results:', response);
        caseStore.update(state => ({
            ...state,
            searchedImages: response,
            isSearchingImages: false,
        }));
        return response;
    } catch (error) {
        console.error('Image search failed:', error);
    }
}

export async function generatePersona(selectedDocumentName: string, caseId?: string, googleDocLink?: string | null) {
    caseStore.update(state => ({
        ...state,
        generating: true,
        error: null,
        isGeneratingPersona: true,
        selectedDocumentName: selectedDocumentName || null
    }));

    if (caseId) {
        lastCaseIdStore.set(caseId);
    }
    let department = '';
    const currentDepartmentValue = get(currentDepartment);
    if (currentDepartmentValue) {
        department = currentDepartmentValue.name;
    }
    try {
        const response = await patientPersonaService.createPatientPersonaFromUrl(selectedDocumentName, caseId || null, department, googleDocLink || null);
        caseStore.update(state => ({
            ...state,
            persona: {
                id: response.id,
                content: response.content,
                timestamp: new Date().toISOString(),
                type: "ai",
                case_id: response.case_id,
            },
            caseId: response.case_id,
            generating: false,
            isGeneratingPersona: false,
        }));
        if (response.case_id) {
            updateCaseId(response.case_id);
        }
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Generation failed",
            generating: false,
            isGeneratingPersona: false,
        }));
    }
}

// Function to generate a physical exam
export async function generatePhysicalExam(selectedDocumentName: string, caseId?: string, department?: string) {
    caseStore.update(state => ({
        ...state,
        generating: true, error: null, isGeneratingPhysicalExam: true,
        caseId: caseId || null,
        selectedDocumentName: selectedDocumentName || null
    }));

    try {
        const response = await testDataService.createExamTestData(selectedDocumentName, caseId || null);
        caseStore.update(state => ({
            ...state,
            testData: {
                physical_exam: response.content.physical_exam,
                lab_test: response.content.lab_test
            },
            generating: false,
            isGeneratingPhysicalExam: false,
            caseId: response.case_id,
        }));
        updateCaseId(response.case_id);
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Generation failed",
            generating: false,
            isGeneratingPhysicalExam: false,
        }));
    }
}

export async function generateDifferentialDiagnosis(selectedDocumentName: string, caseId?: string) {
    caseStore.update(state => ({
        ...state,
        generating: true,
        error: null,
        isGeneratingDifferential: true,
        caseId: caseId || null,
        selectedDocumentName: selectedDocumentName || null
    }));

    try {
        if (!selectedDocumentName) {
            throw new Error("Selected document name is required");
        }
        const response = await diagnosisContextService.createDiagnosisContext(selectedDocumentName, caseId || "");
        caseStore.update(state => ({
            ...state,
            diagnosisContext: response,
            differentialDiagnosis: response.content.keyDifferentials.map(diff => diff.name),
            generating: false,
            isGeneratingDifferential: false,
            caseId: response.case_id.toString(),
        }));
        updateCaseId(response.case_id.toString());
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Differential diagnosis generation failed",
            generating: false,
            isGeneratingDifferential: false,
        }));
    }
}

// Load existing case by id for edit more for docotrs before publishing
export async function loadExistingCase(id: string) {
    try {
        caseStore.update(state => ({ ...state, loading: true }));
        const caseData = await getCaseDataService().getCaseById(id);
        console.log(caseData);
        caseStore.update((state) => ({
            ...state,
            caseId: id,
            persona: caseData.persona,
            historyContext: caseData.historyContext,
            treatmentContext: caseData.treatmentContext,
            clinicalFindingsContext: caseData.clinicalFindingsContext,
            diagnosisContext: caseData.diagnosisContext,
            testData: {
                physical_exam: caseData.testData?.physical_exam,
                lab_test: caseData.testData?.lab_test,
            },
            coverImage: {
                image_url: caseData.coverImage?.image_url || "",
                prompt: caseData.coverImage?.prompt || "",
                title: caseData.coverImage?.title || "",
                quote: caseData.coverImage?.quote || "",
            },
            googleDocLink: caseData.googleDocLink || null,
            doc_has_changed: caseData.doc_has_changed || false,
            differentialDiagnosis: caseData.diagnosisContext?.content.keyDifferentials.map(diff => diff.name) || caseData.differentialDiagnosis,
            selectedDocumentName: caseData.selectedDocumentName,
        }));
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Failed to load case data"
        }));
    } finally {
        caseStore.update(state => ({ ...state, loading: false }));
    }
}

// Function to generate history context summary
export async function generateHistoryContext(selectedDocumentName: string, caseId: string | null = null) {
    caseStore.update(state => ({
        ...state,
        generating: true,
        error: null,
        isGeneratingHistoryContext: true,
        caseId: caseId,
        selectedDocumentName: selectedDocumentName || null
    }));

    try {
        if (!selectedDocumentName) {
            throw new Error("Selected document name is required");
        }
        const response = await historyContextService.createHistoryContext(selectedDocumentName, caseId || "");
        caseStore.update(state => ({
            ...state,
            historyContext: response,
            generating: false,
            isGeneratingHistoryContext: false,
            caseId: response.case_id,
        }));
        updateCaseId(response.case_id);
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "History context generation failed",
            generating: false,
            isGeneratingHistoryContext: false,
        }));
    }
}

// Function to generate treatment context
export async function generateTreatmentContext(selectedDocumentName: string, caseId: string | null = null) {
    caseStore.update(state => ({
        ...state,
        generating: true,
        error: null,
        isGeneratingTreatmentContext: true,
        caseId: caseId,
        selectedDocumentName: selectedDocumentName || null
    }));

    try {
        if (!selectedDocumentName) {
            throw new Error("Selected document name is required");
        }
        const response = await treatmentContextService.createTreatmentContext(selectedDocumentName, caseId || "");
        caseStore.update(state => ({
            ...state,
            treatmentContext: response,
            generating: false,
            isGeneratingTreatmentContext: false,
            caseId: response.case_id.toString(),
        }));
        updateCaseId(response.case_id.toString());
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Treatment context generation failed",
            generating: false,
            isGeneratingTreatmentContext: false,
        }));
    }
}

// Function to generate clinical findings context
export async function generateClinicalFindingsContext(selectedDocumentName: string, caseId: string | null = null) {
    caseStore.update(state => ({
        ...state,
        generating: true,
        error: null,
        isGeneratingClinicalFindingsContext: true,
        caseId: caseId,
        selectedDocumentName: selectedDocumentName || null
    }));

    try {
        if (!selectedDocumentName) {
            throw new Error("Selected document name is required");
        }
        const response = await getClinicalFindingsService().createClinicalFindingsContext(selectedDocumentName, caseId || "");
        caseStore.update(state => ({
            ...state,
            clinicalFindingsContext: response,
            generating: false,
            isGeneratingClinicalFindingsContext: false,
            caseId: response.case_id.toString(),
        }));
        updateCaseId(response.case_id.toString());
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Clinical findings context generation failed",
            generating: false,
            isGeneratingClinicalFindingsContext: false,
        }));
    }
}