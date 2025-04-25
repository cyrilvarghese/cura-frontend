<script lang="ts">
    import CaseData from "../case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        caseStore,
        generatePersona,
        generatePhysicalExam,
        generateDifferentialDiagnosis,
        generateHistoryContext,
        type CaseStoreState,
        lastCaseIdStore,
        loadExistingCase,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy, onMount } from "svelte";
    import type { DocumentUploadResponse } from "$lib/services/documentService";
    import {
        CaseDataService,
        type PublishCaseParams,
    } from "$lib/services/caseDataService";
    import { currentDepartment, type Department } from "$lib/stores/teamStore";
    import GoogleDocLink from "$lib/components/ui/google-doc-link.svelte";
    import { setContext } from "svelte";

    const caseDataService = new CaseDataService();

    let department = $state<Department | null>(null);
    let isPublishing = $state(false);
    let publishError = $state<string | null>(null);
    let publishSuccess = $state(false);
    let isEditMode = $state(false);
    let caseId = $state<string | null>(null);

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
        historyContext: null,
        uploadedFile: null,
        uploadedFileName: null,
        isGeneratingPersona: false,
        isGeneratingPhysicalExam: false,
        isGeneratingDifferential: false,
        isGeneratingHistoryContext: false,
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

        if (type === "new") {
            // Clear state for new cases
            caseStore.set(initialValue);
            isEditMode = false;
            const fileName = urlParams.get("fileName");
            uploadState.selectedDocumentName = fileName;
            uploadState.googleDocLink = urlParams.get("googleDocLink");
            console.log("File name from URL:", fileName);
        } else if (caseId) {
            // Load existing case for edit mode
            isEditMode = true;
            lastCaseIdStore.set(caseId);
            await loadExistingCase(caseId);
        }
    });

    onDestroy(() => {
        unsubscribe();
        unsubscribeDepartment();
    });

    async function handleGenerateAll() {
        if (!uploadState.selectedDocumentName) return;

        uploadState.generating = true;
        uploadState.error = null;

        try {
            uploadState.isGeneratingPersona = true;
            await handleGeneratePersona();
            uploadState.isGeneratingPersona = false;

            uploadState.isGeneratingPhysicalExam = true;
            await handleGenerateCaseData();
            uploadState.isGeneratingPhysicalExam = false;

            uploadState.isGeneratingDifferential = true;
            await handleGenerateDifferentialDiagnosis();
            uploadState.isGeneratingDifferential = false;
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
            console.error("Generation error:", error);
        } finally {
            uploadState.generating = false;
            uploadState.isGeneratingPersona = false;
            uploadState.isGeneratingPhysicalExam = false;
            uploadState.isGeneratingDifferential = false;
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
        console.log(
            "uploadState.selectedDocument",
            uploadState.selectedDocumentName,
        );
        console.log("uploadState.caseId", uploadState.caseId);
        if (!uploadState.selectedDocumentName || !uploadState.caseId) return;
        currentTab = "physical-exams";
        uploadState.isGeneratingPhysicalExam = true;

        console.log("uploadState.caseId", uploadState.caseId);
        try {
            await generatePhysicalExam(
                uploadState.selectedDocumentName,
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
                    Extracting Differential Diagnosis...
                {:else}
                    Generate Differential Diagnosis
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
