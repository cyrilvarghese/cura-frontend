import { writable } from 'svelte/store';
import { FinalDiagnosisService, type FinalDiagnosis } from '$lib/services/finalDiagnosisService';

const finalDiagnosisService = new FinalDiagnosisService();

function createFinalDiagnosisStore() {
    const { subscribe, set } = writable<FinalDiagnosis | null>(null);

    return {
        subscribe,
        recordFinalDiagnosis: async (caseId: string, diagnosis: string, justification: string) => {
            try {
                if (!diagnosis.trim() || !justification.trim()) {
                    throw new Error('Both diagnosis and justification are required');
                }

                const response = await finalDiagnosisService.recordFinalDiagnosis({
                    case_id: caseId,
                    final_diagnosis: diagnosis,
                    final_reason: justification
                });

                const finalDiagnosis: FinalDiagnosis = {
                    diagnosis,
                    justification
                };

                set(finalDiagnosis);
                return response;
            } catch (error) {
                console.error('Error in final diagnosis store:', error);
                throw error;
            }
        }
    };
}

export const finalDiagnosisStore = createFinalDiagnosisStore(); 