import { writable } from 'svelte/store';
import { DiagnosisService, type Diagnosis } from '$lib/services/diagnosisService';

const diagnosisService = new DiagnosisService();

function createDiagnosisStore() {
    const { subscribe, set } = writable<Diagnosis[]>([]);

    return {
        subscribe,
        recordDiagnosis: async (caseId: string, diagnoses: Diagnosis[]) => {
            try {
                const primaryDiagnosis = diagnoses.find(d => d.status === 'primary');
                if (!primaryDiagnosis || !primaryDiagnosis.justification) {
                    throw new Error('Primary diagnosis with justification is required');
                }

                const differentials = diagnoses
                    .filter(d => d.status === 'differential')
                    .map(d => d.text);

                const response = await diagnosisService.recordDiagnosis({
                    case_id: caseId,
                    primary_diagnosis: primaryDiagnosis.text,
                    reason: primaryDiagnosis.justification,
                    differentials
                });

                set(diagnoses);
                return response;
            } catch (error) {
                console.error('Error in diagnosis store:', error);
                throw error;
            }
        }
    };
}

export const diagnosisStore = createDiagnosisStore(); 