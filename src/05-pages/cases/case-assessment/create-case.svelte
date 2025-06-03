<script lang="ts">
    import CaseData from "../case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        caseStore,
        generatePersona,
        generatePhysicalExam,
        generateDifferentialDiagnosis,
        generateHistoryContext,
        generateTreatmentContext,
        generateClinicalFindingsContext,
        lastCaseIdStore,
        loadExistingCase,
    } from "$lib/stores/caseCreatorStore";
    import type { CaseStoreState } from "$lib/types/caseTypes";
    import { onDestroy, onMount } from "svelte";
    import {
        CaseDataService,
        type PublishCaseParams,
    } from "$lib/services/caseDataService";
    import { currentDepartment, type Department } from "$lib/stores/teamStore";
    import GoogleDocLink from "$lib/components/ui/google-doc-link.svelte";
    import { setContext } from "svelte";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import ConfirmationDialog from "$lib/components/ui/confirmation-dialog.svelte";
    import { automatedCaseGenerationService } from "$lib/services/automatedCaseGenerationService";

    const caseDataService = new CaseDataService();

    let department = $state<Department | null>(null);
    let isPublishing = $state(false);
    let publishError = $state<string | null>(null);
    let publishSuccess = $state(false);
    let isEditMode = $state(false);
    let caseId = $state<string | null>(null);
    let isLoading = $state(false);

    const { type = "new" } = $props<{ type?: "new" | "edit" }>();

    // Set the context at the top level
    setContext("case-type", type);

    const initialValue: CaseStoreState = {
        generating: false,
        error: null,
        persona: null,
        loading: false,
        testData: {
            physical_exam: {},
            lab_test: {},
        },
        coverImage: {
            image_url: "",
            prompt: "",
            title: "",
            quote: "",
        },
        caseId: null,
        differentialDiagnosis: [],
        diagnosisContext: null,
        historyContext: null,
        treatmentContext: null,
        clinicalFindingsContext: null,
        uploadedFile: null,
        uploadedFileName: null,
        isGeneratingPersona: false,
        isGeneratingPhysicalExam: false,
        isGeneratingDifferential: false,
        isGeneratingHistoryContext: false,
        isGeneratingTreatmentContext: false,
        isGeneratingClinicalFindingsContext: false,
        isSearchingImages: false,
        searchedImages: {
            images: [],
        },
        selectedDocumentName: null,
        googleDocLink: null,
        doc_has_changed: false,
    };

    let uploadState = $state(initialValue);
    let currentTab = $state<
        | "patient-persona"
        | "physical-exams"
        | "lab-results"
        | "case-summary"
        | "cover-image"
        | "examination-editor"
        | "differential-diagnosis"
        | "history-summary"
        | "treatment-context"
        | "clinical-findings-context"
    >("patient-persona");

    const unsubscribeDepartment = currentDepartment.subscribe((value) => {
        department = value;
    });

    const unsubscribe = caseStore.subscribe((state) => {
        uploadState = state;
    });

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        caseId = urlParams.get("caseId");
        console.log("Case ID:", caseId);

        // Clear state for all cases initially
        caseStore.set(initialValue);

        if (type === "new") {
            isEditMode = false;
            const fileName = urlParams.get("fileName");
            uploadState.selectedDocumentName = fileName;
            uploadState.googleDocLink = urlParams.get("googleDocLink");
            console.log("File name from URL:", fileName);
        } else if (caseId) {
            // Load existing case for edit mode
            isEditMode = true;
            isLoading = true;
            lastCaseIdStore.set(caseId);
            try {
                debugger;
                await loadExistingCase(caseId);
            } catch (error) {
                console.error("Error loading case:", error);
                uploadState.error =
                    error instanceof Error
                        ? error.message
                        : "Failed to load case";
            } finally {
                isLoading = false;
            }
        }
    });

    onDestroy(() => {
        unsubscribe();
        unsubscribeDepartment();
    });

    // Add state variables for the alert dialogs
    let generateAllConfirmOpen = $state(false);
    let generatePhysicalExamConfirmOpen = $state(false);

    async function handleGenerateAll() {
        if (isEditMode) {
            generateAllConfirmOpen = true;
            return;
        }

        executeGenerateAll();
    }

    async function executeGenerateAll() {
        if (!uploadState.selectedDocumentName) return;

        uploadState.generating = true;
        uploadState.error = null;

        try {
            await automatedCaseGenerationService.generateAllCaseData(
                {
                    documentName: uploadState.selectedDocumentName,
                    googleDocLink: uploadState.googleDocLink || "",
                    departmentName: department?.name || "",
                },
                (progress) => {
                    // Update individual loading states based on progress
                    uploadState.isGeneratingPersona =
                        progress.step === "Patient Persona" &&
                        !progress.isComplete;
                    uploadState.isGeneratingPhysicalExam =
                        progress.step === "Physical Exam Data" &&
                        !progress.isComplete;
                    uploadState.isGeneratingDifferential =
                        progress.step === "Differential Diagnosis" &&
                        !progress.isComplete;
                    uploadState.isGeneratingHistoryContext =
                        progress.step === "History Summary" &&
                        !progress.isComplete;
                    uploadState.isGeneratingTreatmentContext =
                        progress.step === "Treatment Context" &&
                        !progress.isComplete;
                    uploadState.isGeneratingClinicalFindingsContext =
                        progress.step === "Clinical Findings" &&
                        !progress.isComplete;

                    // Update current tab based on generation step
                    switch (progress.step) {
                        case "Patient Persona":
                            currentTab = "patient-persona";
                            break;
                        case "Physical Exam Data":
                            currentTab = "physical-exams";
                            break;
                        case "Differential Diagnosis":
                            currentTab = "differential-diagnosis";
                            break;
                        case "History Summary":
                            currentTab = "history-summary";
                            break;
                        case "Treatment Context":
                            currentTab = "treatment-context";
                            break;
                        case "Clinical Findings":
                            currentTab = "clinical-findings-context";
                            break;
                        case "Cover Image":
                            currentTab = "cover-image";
                            break;
                    }

                    if (progress.error) {
                        uploadState.error = progress.error;
                    }
                },
            );
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
            console.error("Generation error:", error);
        } finally {
            uploadState.generating = false;
            uploadState.isGeneratingPersona = false;
            uploadState.isGeneratingPhysicalExam = false;
            uploadState.isGeneratingDifferential = false;
            uploadState.isGeneratingHistoryContext = false;
            uploadState.isGeneratingTreatmentContext = false;
            uploadState.isGeneratingClinicalFindingsContext = false;
        }
    }

    async function handleGeneratePersona() {
        if (!uploadState.selectedDocumentName) return;
        currentTab = "patient-persona";
        uploadState.isGeneratingPersona = true;

        try {
            if (!uploadState.selectedDocumentName) return;
            await generatePersona(
                uploadState.selectedDocumentName,
                uploadState.caseId || "",
                uploadState.googleDocLink || "",
            );
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
            throw error;
        } finally {
            uploadState.isGeneratingPersona = false;
        }
    }

    async function handleGenerateCaseData() {
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;

        if (isEditMode) {
            generatePhysicalExamConfirmOpen = true;
            return;
        }

        executeGenerateCaseData();
    }

    async function executeGenerateCaseData() {
        currentTab = "physical-exams";
        uploadState.isGeneratingPhysicalExam = true;

        try {
            await generatePhysicalExam(
                uploadState.selectedDocumentName || "",
                uploadState.caseId || "",
            );
        } catch (error) {
            console.error("Error generating physical exam:", error);
            throw error;
        } finally {
            uploadState.isGeneratingPhysicalExam = false;
        }
    }

    async function handleGenerateDifferentialDiagnosis() {
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;
        currentTab = "differential-diagnosis";
        uploadState.isGeneratingDifferential = true;

        try {
            await generateDifferentialDiagnosis(
                uploadState.selectedDocumentName || "",
                uploadState.caseId || "",
            );
        } catch (error) {
            console.error("Error generating differential diagnosis:", error);
            throw error;
        } finally {
            uploadState.isGeneratingDifferential = false;
        }
    }

    async function handleGenerateHistorySummary() {
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;
        currentTab = "history-summary";
        uploadState.isGeneratingHistoryContext = true;

        try {
            await generateHistoryContext(
                uploadState.selectedDocumentName,
                uploadState.caseId,
            );
        } catch (error) {
            console.error("Error generating history summary:", error);
            throw error;
        } finally {
            uploadState.isGeneratingHistoryContext = false;
        }
    }

    async function handleTreatmentContext() {
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;
        currentTab = "treatment-context";
        uploadState.isGeneratingTreatmentContext = true;

        try {
            await generateTreatmentContext(
                uploadState.selectedDocumentName,
                uploadState.caseId,
            );
        } catch (error) {
            console.error("Error generating treatment context:", error);
            throw error;
        } finally {
            uploadState.isGeneratingTreatmentContext = false;
        }
    }

    async function handleClinicalFindingsContext() {
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;
        currentTab = "clinical-findings-context";
        uploadState.isGeneratingClinicalFindingsContext = true;

        try {
            await generateClinicalFindingsContext(
                uploadState.selectedDocumentName,
                uploadState.caseId,
            );
        } catch (error) {
            console.error("Error generating clinical findings context:", error);
            throw error;
        } finally {
            uploadState.isGeneratingClinicalFindingsContext = false;
        }
    }

    async function handlePublishCase() {
        if (!department) return;

        isPublishing = true;
        publishError = null;
        publishSuccess = false;

        try {
            const params: PublishCaseParams = {
                published: true,
                // Add other case data here
            };

            await caseDataService.publishCase(uploadState.caseId!, params);

            publishSuccess = true;
            uploadState.doc_has_changed = false;
        } catch (error) {
            publishError =
                error instanceof Error
                    ? error.message
                    : "Failed to publish case";
        } finally {
            isPublishing = false;
        }
    }
</script>

<div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold">
        {isEditMode ? "Edit Case" : "Create Case"}
    </h1>
</div>

<LoadingOverlay isVisible={isLoading} message="Loading case data..." />

<p class="text-gray-500 mb-8">
    {#if isEditMode}
        Edit an existing case for
        <GoogleDocLink
            docName={uploadState.selectedDocumentName || ""}
            docLink={uploadState.googleDocLink}
        />
        {#if uploadState.doc_has_changed}
            <span class="text-xs text-red-600">
                ( This case is out of date with the Google Doc. Please update
                the case )
            </span>
        {/if}
    {:else}
        Create a new case for
        <GoogleDocLink
            docName={uploadState.selectedDocumentName || ""}
            docLink={uploadState.googleDocLink}
        />
    {/if}
</p>
<div class="flex flex-row items-start justify-start gap-4">
    <div class="pt-8">
        <p class="text-md font-medium pb-6">Available Actions</p>
        <div class="flex flex-col justify-center mb-12">
            <Button
                onclick={handleGenerateAll}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode) ||
                    (isEditMode && !caseId)}
            >
                {#if uploadState.generating}
                    Generating All...
                {:else}
                    Generate All Data
                {/if}
            </Button>
        </div>

        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleGeneratePersona}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode) ||
                    (isEditMode && !caseId)}
            >
                {#if uploadState.isGeneratingPersona}
                    Generating Patient Persona...
                {:else}
                    Generate Patient Persona
                {/if}
            </Button>
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleGenerateCaseData}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode)}
            >
                {#if uploadState.isGeneratingPhysicalExam}
                    Generating Physical Exam Data...
                {:else}
                    Generate Physical Exam Data
                {/if}
            </Button>
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleGenerateDifferentialDiagnosis}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode)}
            >
                {#if uploadState.isGeneratingDifferential}
                    Generating Diagnosis Context...
                {:else}
                    Generate Diagnosis Context
                {/if}
            </Button>
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleGenerateHistorySummary}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode)}
            >
                {#if uploadState.isGeneratingHistoryContext}
                    Generating Case History Summary...
                {:else}
                    Generate Case History Summary
                {/if}
            </Button>
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleTreatmentContext}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode)}
            >
                {#if uploadState.isGeneratingTreatmentContext}
                    Generating Treatment Context...
                {:else}
                    Generate Treatment Context
                {/if}
            </Button>
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                variant="secondary"
                onclick={handleClinicalFindingsContext}
                disabled={uploadState.generating ||
                    (!uploadState.selectedDocumentName && !isEditMode)}
            >
                {#if uploadState.isGeneratingClinicalFindingsContext}
                    Generating Clinical Findings Context...
                {:else}
                    Generate Clinical Findings Context
                {/if}
            </Button>
        </div>

        <!-- Publish Case Button -->
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handlePublishCase}
                disabled={isPublishing ||
                    (!uploadState.caseId && !isEditMode) ||
                    !department ||
                    uploadState.generating}
                class="bg-green-600 hover:bg-green-700 text-white"
            >
                {#if isPublishing}
                    {isEditMode ? "Updating Case..." : "Publishing Case..."}
                {:else}
                    {isEditMode ? "Update Case" : "Publish Case"}
                {/if}
            </Button>

            {#if publishSuccess}
                <p class="text-xs mt-1 text-green-600 font-medium">
                    Case published successfully!
                </p>
            {/if}

            {#if publishError}
                <p class="text-xs mt-1 text-red-600 font-medium">
                    Error: {publishError}
                </p>
            {/if}

            {#if !uploadState.caseId && !isPublishing && !isEditMode}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please generate case data before publishing
                </p>
            {/if}

            {#if !department && !isPublishing && !isEditMode}
                <p class="text-xs mt-1 text-muted-foreground">
                    No department selected. Please select a department before
                    publishing.
                </p>
            {/if}
        </div>
    </div>

    <CaseData {uploadState} {currentTab} />
</div>

<!-- Add the confirmation dialogs at the end of the file -->
<ConfirmationDialog
    bind:open={generateAllConfirmOpen}
    title="Regenerate All Case Data?"
    description="This will erase all the edits and images uploaded by you. Are you sure you want to continue?"
    confirmText="Create Data From Scratch"
    onConfirm={executeGenerateAll}
/>

<ConfirmationDialog
    bind:open={generatePhysicalExamConfirmOpen}
    title="Erase All Data?"
    description="This will erase all the edits and images uploaded by you. Are you sure you want to continue?"
    confirmText="Create Data From Scratch"
    onConfirm={executeGenerateCaseData}
/>
