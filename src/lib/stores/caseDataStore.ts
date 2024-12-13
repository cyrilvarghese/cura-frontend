import { writable } from 'svelte/store';
import { CaseDataService, type CaseData } from '$lib/services/caseDataService';
import { API_BASE_URL } from '$lib/config/api';

const caseDataService = new CaseDataService(API_BASE_URL); // Initialize the service
export const caseDataStore = writable<CaseData | null>(null); // Store to hold case data

export const fetchCaseData = async (caseId: string) => {
    try {
        debugger;
        const caseData = await caseDataService.getCaseData(caseId);
        caseDataStore.set(caseData); // Update the store with fetched case data
    } catch (error) {
        console.error('Error fetching case data:', error);
        caseDataStore.set(null); // Reset store on error
    }
}; 