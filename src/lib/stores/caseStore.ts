import { writable } from 'svelte/store';
import { patientPersonaService } from '$lib/services/patientPersonaService'; // Adjust the import based on your project structure
import { testDataService } from '$lib/services/testDataService'; // Adjust the import based on your project structure
import type { FormattedPersonaResponse } from '$lib/types';

// Define the store state interface
export interface CaseStoreState {
    loading: boolean;
    fileUploaded: boolean;
    generating: boolean;
    error: string | null;
    persona: FormattedPersonaResponse | null; // Adjust the type based on your response structure
    testData: { // Updated type to match the response structure
        physical_exam: any; // Define the structure of physical_exam as needed
        lab_test: any; // Define the structure of lab_test as needed
    } | null; // Allow null if no data is available
}

// Create a writable store with initial state
const initialState: CaseStoreState = {
    loading: false,
    fileUploaded: false,
    generating: false,
    error: null,
    persona: null,
    testData: null,
};

export const caseStore = writable<CaseStoreState>(initialState);

// Function to generate a persona
export async function generatePersona(uploadedFile: File, caseId: string) {
    caseStore.update(state => ({ ...state, generating: true, error: null }));

    try {
        const response = await patientPersonaService.createPatientPersona(uploadedFile, caseId);
        caseStore.update(state => ({
            ...state,
            persona: {
                id: response.id,
                content: response.content,
                timestamp: new Date().toISOString(),
                type: "ai",
            },
            generating: false,
        }));
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Generation failed",
            generating: false,
        }));
    }
}

// Function to generate a physical exam
export async function generatePhysicalExam(uploadedFile: File, caseId: string) {
    caseStore.update(state => ({ ...state, generating: true, error: null }));

    try {
        const response = await testDataService.createExamTestData(caseId, uploadedFile);
        caseStore.update(state => ({
            ...state,
            testData: {
                physical_exam: response.content.physical_exam,
                lab_test: response.content.lab_test
            },
            generating: false
        }));
    } catch (error) {
        caseStore.update(state => ({
            ...state,
            error: error instanceof Error ? error.message : "Generation failed",
            generating: false,
        }));
    }
} 