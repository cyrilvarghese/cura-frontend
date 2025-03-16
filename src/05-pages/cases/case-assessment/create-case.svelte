<script lang="ts">
    import CaseData from "../case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Upload } from "lucide-svelte";
    import {
        caseStore,
        generatePersonaFromUrl,
        generatePhysicalExamFromUrl,
        generateDifferentialDiagnosisFromUrl,
        type CaseStoreState,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy, onMount } from "svelte";
    import {
        documentStore,
        fetchDocumentsByTopic,
    } from "$lib/stores/documentStore";
    import type { DocumentUploadResponse } from "$lib/services/documentService";
    import {
        CaseDataService,
        type PublishCaseParams,
    } from "$lib/services/caseDataService";
    import { currentDepartment, type Department } from "$lib/stores/teamStore";
    //on mount get documetns for teh topic
    // Define initialValue based on the expected structure of CaseStoreState
    const initialValue: CaseStoreState = {
        // fileUploaded: false,
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
        selectedDocument: null,
    };
    let { topic, code } = $props();

    // Create an instance of CaseDataService
    const caseDataService = new CaseDataService();

    let topicDocuments = $state<DocumentUploadResponse[]>([]);
    let isLoadingDocuments = $state(false);
    let documentError = $state<string | null>(null);
    let isPublishing = $state(false);
    let publishError = $state<string | null>(null);
    let publishSuccess = $state(false);
    let department = $state<Department | null>(null);

    // Subscribe to the currentDepartment store
    const unsubscribeDepartment = currentDepartment.subscribe((value) => {
        department = value;
    });

    const unsubscribeDocStore = documentStore.subscribe((state) => {
        topicDocuments = state.documents[topic] || [];
        isLoadingDocuments = state.isLoading;
        documentError = state.error;
    });

    onMount(() => {
        if (topic) {
            fetchDocumentsByTopic(topic).catch((error) => {
                console.error("Error fetching documents:", error);
            });
        }
    });

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
    let uploadedFileName: string | null = $state(null);

    // Subscribe to the caseStore
    const unsubscribe = caseStore.subscribe((state) => {
        uploadState = state;
        uploadedFileName = state.uploadedFileName;
    });

    onDestroy(() => {
        unsubscribe(); // Clean up the subscription when the component is destroyed
        unsubscribeDocStore(); // Clean up the document store subscription
        unsubscribeDepartment(); // Clean up the department store subscription
    });

    async function handleGenerateAll() {
        if (!uploadState.selectedDocument) return;
        uploadState.generating = true;
        uploadState.error = null;

        try {
            // Update store loading states instead of local ones
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
            // Reset all loading states in case of error
            uploadState.isGeneratingPersona = false;
            uploadState.isGeneratingPhysicalExam = false;
            uploadState.isGeneratingDifferential = false;
        }
    }

    async function handleGeneratePersona() {
        if (!uploadState.selectedDocument) return;
        currentTab = "patient-persona";
        uploadState.isGeneratingPersona = true;

        try {
            if (!uploadState.selectedDocument) return;
            await generatePersonaFromUrl(
                uploadState.selectedDocument.url,
                uploadState.selectedDocument,
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
            uploadState.selectedDocument,
        );
        console.log("uploadState.caseId", uploadState.caseId);
        if (!uploadState.selectedDocument || !uploadState.caseId) return;
        currentTab = "physical-exams";
        uploadState.isGeneratingPhysicalExam = true;

        try {
            await generatePhysicalExamFromUrl(
                uploadState.selectedDocument.url,
                uploadState.selectedDocument,
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
        if (!uploadState.selectedDocument || !uploadState.caseId) return;
        currentTab = "differential-diagnosis";
        uploadState.isGeneratingDifferential = true;

        try {
            await generateDifferentialDiagnosisFromUrl(
                uploadState.selectedDocument?.url || "",
                uploadState.selectedDocument || undefined,
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
                department: department.name,
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

<div class="flex flex-row items-start justify-start gap-4">
    <div>
        <div class="flex w-full gap-4">
            <Card.Root class="max-w-md shadow-md rounded-lg bg-white w-[300px]">
                <Card.Header>
                    <Card.Title class="text-lg font-semibold"
                        >Select case document</Card.Title
                    >
                </Card.Header>
                <Card.Content>
                    <div class="space-y-8">
                        <div class="grid w-full items-center gap-1.5">
                            <label
                                for="document-select"
                                class="text-sm leading-none"
                            >
                                Select Document
                            </label>
                            <select
                                id="document-select"
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                bind:value={uploadState.selectedDocument}
                                disabled={uploadState.loading ||
                                    uploadState.generating}
                            >
                                <option value="">Select a document...</option>
                                {#each topicDocuments as document}
                                    <option value={document}>
                                        {document.title}
                                    </option>
                                {/each}
                            </select>
                            {#if topicDocuments.length === 0}
                                <p class="text-xs text-muted-foreground mt-1">
                                    No documents available for this topic
                                </p>
                            {/if}
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Topic Documents Section -->

        <div class="flex flex-col justify-start mt-4 mb-12">
            <Button
                onclick={handleGenerateAll}
                disabled={uploadState.generating ||
                    !uploadState.selectedDocument}
            >
                {#if uploadState.generating}
                    Generating All...
                {:else}
                    Generate All Data
                {/if}
            </Button>
            {#if (!uploadState.caseId || !uploadState.uploadedFile) && !uploadState.generating}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>

        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGeneratePersona}
                disabled={uploadState.generating ||
                    !uploadState.selectedDocument}
            >
                {#if uploadState.isGeneratingPersona}
                    Generating Patient Persona...
                {:else}
                    Generate Patient Persona
                {/if}
            </Button>
            {#if (!uploadState.caseId || !uploadState.uploadedFile) && !uploadState.generating}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGenerateCaseData}
                disabled={uploadState.generating ||
                    !uploadState.selectedDocument}
            >
                {#if uploadState.isGeneratingPhysicalExam}
                    Generating Physical Exam Data...
                {:else}
                    Generate Physical Exam Data
                {/if}
            </Button>
            {#if (!uploadState.caseId || !uploadState.uploadedFile) && !uploadState.generating}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGenerateDifferentialDiagnosis}
                disabled={uploadState.generating ||
                    !uploadState.selectedDocument}
            >
                {#if uploadState.isGeneratingDifferential}
                    Extracting Differential Diagnosis...
                {:else}
                    Generate Differential Diagnosis
                {/if}
            </Button>
            {#if !uploadState.selectedDocument && !uploadState.generating}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
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
