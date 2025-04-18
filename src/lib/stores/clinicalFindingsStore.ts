import { writable } from 'svelte/store';
import { ClinicalFindingsService } from '$lib/services/clinicalFindingsService';

const clinicalFindingsService = new ClinicalFindingsService();

function createClinicalFindingsStore() {
    const { subscribe, set } = writable<string[]>([]);

    return {
        subscribe,
        recordFindings: async (caseId: string, findings: string[]) => {
            try {
                const response = await clinicalFindingsService.recordFindings({
                    case_id: caseId,
                    findings
                });
                set(findings);
                return response;
            } catch (error) {
                console.error('Error in clinical findings store:', error);
                throw error;
            }
        }
    };
}

export const clinicalFindingsStore = createClinicalFindingsStore(); 