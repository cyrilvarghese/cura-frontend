import {
    generatePersona,
    generatePhysicalExam,
    generateDifferentialDiagnosis,
    generateHistoryContext,
    generateTreatmentContext,
    generateClinicalFindingsContext,
    caseStore,
} from "$lib/stores/caseCreatorStore";
import { get } from "svelte/store";
import { coverImageService } from "$lib/services/coverImageService";

export interface CaseGenerationProgress {
    step: string;
    current: number;
    total: number;
    isComplete: boolean;
    caseName?: string;
    error?: string;
}

export interface CaseGenerationParams {
    documentName: string;
    googleDocLink: string;
    departmentName?: string;
}

export type ProgressCallback = (progress: CaseGenerationProgress) => void;

export class AutomatedCaseGenerationService {
    private readonly steps = [
        { name: "Patient Persona", fn: this.generatePersonaStep },
        { name: "Physical Exam Data", fn: this.generatePhysicalExamStep },
        { name: "Differential Diagnosis", fn: this.generateDifferentialDiagnosisStep },
        { name: "History Summary", fn: this.generateHistorySummaryStep },
        { name: "Treatment Context", fn: this.generateTreatmentContextStep },
        { name: "Clinical Findings", fn: this.generateClinicalFindingsStep },
        { name: "Cover Image", fn: this.generateCoverImageStep },
    ];

    async generateAllCaseData(
        params: CaseGenerationParams,
        onProgress?: ProgressCallback
    ): Promise<string | null> {
        const { documentName, googleDocLink } = params;

        if (!documentName) {
            throw new Error("Document name is required");
        }

        let caseId: string | null = null;

        try {
            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];

                // Report progress
                onProgress?.({
                    step: step.name,
                    current: i,
                    total: this.steps.length,
                    isComplete: false,
                    caseName: documentName,
                });

                // Execute the step
                caseId = await step.fn.call(this, documentName, caseId, googleDocLink);

                // Report completion of current step
                onProgress?.({
                    step: step.name,
                    current: i + 1,
                    total: this.steps.length,
                    isComplete: i === this.steps.length - 1,
                    caseName: documentName,
                });
            }

            return caseId;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Generation failed";
            onProgress?.({
                step: "Error",
                current: 0,
                total: this.steps.length,
                isComplete: false,
                caseName: documentName,
                error: errorMessage,
            });
            throw error;
        }
    }

    private async generatePersonaStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        await generatePersona(documentName, caseId || "", googleDocLink);

        // Wait for the caseId to be updated in the store
        return await this.waitForCaseId();
    }

    private async generatePhysicalExamStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for physical exam generation");

        await generatePhysicalExam(documentName, caseId);
        return caseId;
    }

    private async generateDifferentialDiagnosisStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for differential diagnosis generation");

        await generateDifferentialDiagnosis(documentName, caseId);
        return caseId;
    }

    private async generateHistorySummaryStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for history summary generation");

        await generateHistoryContext(documentName, caseId);
        return caseId;
    }

    private async generateTreatmentContextStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for treatment context generation");

        await generateTreatmentContext(documentName, caseId);
        return caseId;
    }

    private async generateClinicalFindingsStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for clinical findings generation");

        await generateClinicalFindingsContext(documentName, caseId);
        return caseId;
    }

    private async generateCoverImageStep(
        documentName: string,
        caseId: string | null,
        googleDocLink: string
    ): Promise<string> {
        if (!caseId) throw new Error("Case ID is required for cover image generation");

        await coverImageService.createCoverImage(caseId);
        return caseId;
    }

    private async waitForCaseId(): Promise<string> {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds max wait

            const checkForCaseId = () => {
                const state = get(caseStore);
                if (state.caseId) {
                    resolve(state.caseId);
                } else if (attempts >= maxAttempts) {
                    reject(new Error("Timeout waiting for case ID"));
                } else {
                    attempts++;
                    setTimeout(checkForCaseId, 100);
                }
            };

            checkForCaseId();
        });
    }
}

export const automatedCaseGenerationService = new AutomatedCaseGenerationService(); 