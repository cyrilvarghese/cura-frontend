import { writable, get } from 'svelte/store';
import { patientPersonaService } from '$lib/services/patientPersonaService'; // Adjust the import based on your project structure
import { testDataService } from '$lib/services/testDataService'; // Adjust the import based on your project structure
import type { CoverImageResponse, FormattedPersonaResponse } from '$lib/types';
import { coverImageService } from '$lib/services/coverImageService';
import { differentialDiagnosisService } from '$lib/services/differentialDiagnosisService';
import { imageSearchService, type ImageSearchResponse } from '$lib/services/imageSearchService';
import { currentDepartment } from './teamStore';
import { CaseDataService } from '$lib/services/caseDataService';



// Define the store state interface
export interface CaseStoreState {
    caseId: string | null;
    loading: boolean;
    // fileUploaded: boolean;
    generating: boolean;
    error: string | null;
    persona: FormattedPersonaResponse | null; // Adjust the type based on your response structure
    testData: { // Updated type to match the response structure
        physical_exam: any; // Define the structure of physical_exam as needed
        lab_test: any; // Define the structure of lab_test as needed
    } | null; // Allow null if no data is available
    coverImage: CoverImageResponse | null;
    differentialDiagnosis: any | null;
    uploadedFile: File | null;
    uploadedFileName: string | null;
    isGeneratingPersona: boolean;
    isGeneratingPhysicalExam: boolean;
    isGeneratingDifferential: boolean;
    searchedImages: ImageSearchResponse | null;
    isSearchingImages: boolean;
    selectedDocumentName: string | null;
    googleDocLink: string | null;
}

// Create a writable store with initial state
const initialState: CaseStoreState = {
    loading: false,
    // fileUploaded: false,
    generating: false,
    error: null,
    persona: null,
    testData: null,
    coverImage: null,
    differentialDiagnosis: null,
    caseId: null,
    uploadedFile: null,
    uploadedFileName: null,
    isGeneratingPersona: false,
    isGeneratingPhysicalExam: false,
    isGeneratingDifferential: false,
    searchedImages: null,
    isSearchingImages: false,
    selectedDocumentName: null,
    googleDocLink: null,
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


export async function generatePersona(selectedDocumentName: string, caseId?: string) {
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
        const response = await patientPersonaService.createPatientPersonaFromUrl(selectedDocumentName, caseId || null, department);
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
        const response = await differentialDiagnosisService.createDifferentialDiagnosis(selectedDocumentName, caseId || null);
        caseStore.update(state => ({
            ...state,
            differentialDiagnosis: response.content,
            generating: false,
            isGeneratingDifferential: false,
            caseId: response.case_id,
        }));
        updateCaseId(response.case_id);
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Differential diagnosis generation failed",
            generating: false,
            isGeneratingDifferential: false,

        }));
    }
}

const caseDataService = new CaseDataService();

export async function loadExistingCase(id: string) {
    try {
        caseStore.update(state => ({ ...state, loading: true }));
        const caseData = await caseDataService.getCaseById(id);
        caseStore.update((state) => ({
            ...state,
            caseId: id,
            persona: caseData.persona,
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

            differentialDiagnosis: caseData.differentialDiagnosis,
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