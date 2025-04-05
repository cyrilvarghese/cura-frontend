<script lang="ts">
    import CaseData from "../case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        caseStore,
        generatePersona,
        generatePhysicalExam,
        generateDifferentialDiagnosis,
        type CaseStoreState,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy, onMount } from "svelte";
    import type { DocumentUploadResponse } from "$lib/services/documentService";
    import {
        CaseDataService,
        type PublishCaseParams,
    } from "$lib/services/caseDataService";
    import { currentDepartment, type Department } from "$lib/stores/teamStore";
    import PageLayout from "../../../04-templates/page-layout.svelte";

    const caseDataService = new CaseDataService();

    let selectedCaseDocument = $state<DocumentUploadResponse | null>(null);
    let department = $state<Department | null>(null);
    let isPublishing = $state(false);
    let publishError = $state<string | null>(null);
    let publishSuccess = $state(false);

    const initialValue: CaseStoreState = {
        generating: false,
        error: null,
        persona: null,
        loading: false,
        testData: {
            physical_exam: null,
            lab_test: null,
        },
        coverImage: null,
        caseId: null,
        differentialDiagnosis: null,
        uploadedFile: null,
        uploadedFileName: null,
        isGeneratingPersona: false,
        isGeneratingPhysicalExam: false,
        isGeneratingDifferential: false,
        isSearchingImages: false,
        searchedImages: null,
        selectedDocumentName: null,
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
    >("patient-persona");

    const unsubscribeDepartment = currentDepartment.subscribe((value) => {
        department = value;
    });

    const unsubscribe = caseStore.subscribe((state) => {
        uploadState = state;
    });

    onMount(() => {
        // selectedCaseDocument = $documentStore.selectedCaseDocument;
        console.log("Selected case document from store:", selectedCaseDocument);
        const urlParams = new URLSearchParams(window.location.search);
        const fileName = urlParams.get("fileName");
        uploadState.selectedDocumentName = fileName;
        console.log("File name from URL:", fileName);
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

    async function handlePublishCase() {
        if (!uploadState.caseId || !department) return;

        isPublishing = true;
        publishError = null;
        publishSuccess = false;

        try {
            const params: PublishCaseParams = {
                published: true,
            };

            await caseDataService.publishCase(uploadState.caseId, params);
            publishSuccess = true;
        } catch (error) {
            publishError =
                error instanceof Error
                    ? error.message
                    : "Failed to publish case";
            console.error("Error publishing case:", error);
        } finally {
            isPublishing = false;
        }
    }
</script>

<div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold">Create Case</h1>
</div>
<p class="text-gray-500 mb-8">Create a new case from a master document</p>
<div class="flex flex-row items-start justify-start gap-4">
    <div class="pt-8">
        <p class="text-md font-medium pb-6 ">Available Actions</p>
        <div class="flex flex-col justify-center mb-12">
            <Button
                onclick={handleGenerateAll}
                disabled={uploadState.generating ||
                    !uploadState.selectedDocumentName}
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
                    !uploadState.selectedDocumentName}
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
                    !uploadState.selectedDocumentName}
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
                    !uploadState.selectedDocumentName}
            >
                {#if uploadState.isGeneratingDifferential}
                    Extracting Differential Diagnosis...
                {:else}
                    Generate Differential Diagnosis
                {/if}
            </Button>
        </div>

        <!-- Publish Case Button -->
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handlePublishCase}
                disabled={isPublishing ||
                    !uploadState.caseId ||
                    !department ||
                    uploadState.generating}
                class="bg-green-600 hover:bg-green-700 text-white"
            >
                {#if isPublishing}
                    Publishing Case...
                {:else}
                    Publish Case
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

            {#if !uploadState.caseId && !isPublishing}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please generate case data before publishing
                </p>
            {/if}

            {#if !department && !isPublishing}
                <p class="text-xs mt-1 text-muted-foreground">
                    No department selected. Please select a department before
                    publishing.
                </p>
            {/if}
        </div>
    </div>

    <CaseData {uploadState} {currentTab} />
</div>
