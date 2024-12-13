import { writable } from 'svelte/store';
import { CaseDataService, type CaseData } from '$lib/services/caseDataService';
import { API_BASE_URL } from '$lib/config/api';
import type { DiagnosticTestName, ExaminationName } from '$lib/types';

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
    coverMessage: string;
}

const caseDataService = new CaseDataService(API_BASE_URL);
export const caseDataStore = writable<CaseData | null>(null);

export const fetchCaseData = async (caseId: string) => {
    try {
        const caseData = await caseDataService.getCaseData(caseId);
        caseDataStore.set(caseData);
    } catch (error) {
        console.error('Error fetching case data:', error);
        caseDataStore.set(null);
    }
}; 