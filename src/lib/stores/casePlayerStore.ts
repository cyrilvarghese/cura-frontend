import { writable } from 'svelte/store';
import { CaseDataService, type CaseListItem } from '$lib/services/caseDataService';
import type { DiagnosticTestName, ExaminationName } from '$lib/types/index';
import { API_BASE_URL } from '$lib/config/api';
// Current case ID store
export const currentCaseId = writable<string | null>(null);

// Update the CaseData interface to be more specific about labTestReports
export interface CaseData {
    physicalExamReports: Record<ExaminationName, {
        purpose: string;
        findings: any;
        interpretation: string;
    }>;
    labTestReports: Record<DiagnosticTestName, {
        purpose: string;
        results: any;
        interpretation: string;
    }>;
    coverMessage: any;
}

const caseDataService = new CaseDataService();
export const caseDataStore = writable<CaseData | null>(null);

// Add a new store for the cases list
export const casesListStore = writable<CaseListItem[]>([]);

// Existing fetch case data function
export const fetchCaseData = async (caseId: string) => {
    try {
        const caseData = await caseDataService.getCaseData(caseId);
        caseDataStore.set(caseData);
    } catch (error) {
        console.error('Error fetching case data:', error);
        caseDataStore.set(null);
    }
};

// New function to fetch all cases
export const fetchCases = async () => {
    try {
        const cases = await caseDataService.getAllCases();
        casesListStore.set(cases);
    } catch (error) {
        console.error('Error fetching cases:', error);
        casesListStore.set([]);
    }
};

