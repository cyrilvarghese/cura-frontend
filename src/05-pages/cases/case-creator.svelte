<script lang="ts">
    import CaseData from "./case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Upload } from "lucide-svelte";
    import {
        caseStore,
        generatePersona,
        generatePhysicalExam,
        generateDifferentialDiagnosis,
        type CaseStoreState,
        updateCaseId,
        updateUploadedFile,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy } from "svelte";

    // Define initialValue based on the expected structure of CaseStoreState
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
        selectedDocument: null,
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
    let uploadedFileName: string | null = $state(null);

    // Subscribe to the caseStore
    const unsubscribe = caseStore.subscribe((state) => {
        uploadState = state;
        uploadedFileName = state.uploadedFileName;
    });

    onDestroy(() => {
        unsubscribe(); // Clean up the subscription when the component is destroyed
    });

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (
            !file.type.includes("pdf") &&
            !file.type.includes("markdown") &&
            !file.name.endsWith(".md")
        ) {
            alert("Please upload a PDF or Markdown file only");
            return;
        }

        updateUploadedFile(file);
    }

    function triggerFileUpload() {
        const input = document.getElementById(
            "file-upload-input",
        ) as HTMLInputElement;
        input.click();
    }

    function handleCaseIdChange(newCaseId: string) {
        //check if its a number
        if (isNaN(Number(newCaseId))) {
            alert("Case ID must be a number");
            //reset the case id
            updateCaseId("");
            return;
        }
        updateCaseId(newCaseId);
    }

    async function handleGenerateAll() {
        if (!uploadState.uploadedFile || !uploadState.caseId) return;
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
        if (!uploadState.uploadedFile || !uploadState.caseId) return;
        currentTab = "patient-persona";
        uploadState.isGeneratingPersona = true;

        try {
            await generatePersona(uploadState.uploadedFile, uploadState.caseId);
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
            throw error;
        } finally {
            uploadState.isGeneratingPersona = false;
        }
    }

    async function handleGenerateCaseData() {
        if (!uploadState.uploadedFile || !uploadState.caseId) return;
        currentTab = "physical-exams";
        uploadState.isGeneratingPhysicalExam = true;

        try {
            await generatePhysicalExam(
                uploadState.uploadedFile,
                uploadState.caseId,
            );
        } catch (error) {
            console.error("Error generating physical exam:", error);
            throw error;
        } finally {
            uploadState.isGeneratingPhysicalExam = false;
        }
    }

    async function handleGenerateDifferentialDiagnosis() {
        if (!uploadState.uploadedFile || !uploadState.caseId) return;
        currentTab = "differential-diagnosis";
        uploadState.isGeneratingDifferential = true;

        try {
            await generateDifferentialDiagnosis(
                uploadState.uploadedFile,
                uploadState.caseId,
            );
        } catch (error) {
            console.error("Error generating differential diagnosis:", error);
            throw error;
        } finally {
            uploadState.isGeneratingDifferential = false;
        }
    }
</script>

<div class="flex flex-row items-start justify-start gap-4">
    <div>
        <div class="flex w-full gap-4">
            <Card.Root class="max-w-md shadow-md rounded-lg bg-white w-[300px]">
                <Card.Header>
                    <Card.Title class="text-lg font-semibold"
                        >Upload Patient Case Document</Card.Title
                    >
                </Card.Header>
                <Card.Content>
                    <div class="space-y-8">
                        <div class="grid w-full items-center gap-1.5">
                            <label for="case-id" class="text-sm leading-none"
                                >Case ID</label
                            >
                            <input
                                id="case-id"
                                type="text"
                                bind:value={uploadState.caseId}
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Enter case ID"
                                disabled={uploadState.loading ||
                                    uploadState.generating}
                                oninput={(e) =>
                                    handleCaseIdChange(e.currentTarget.value)}
                            />
                        </div>

                        <div class="grid w-full items-center gap-1.5">
                            <label
                                for="file-upload"
                                class="text-sm leading-none"
                                >Patient Case Document</label
                            >
                            <input
                                id="file-upload-input"
                                type="file"
                                class="hidden"
                                onchange={handleFileUpload}
                                disabled={uploadState.loading ||
                                    uploadState.generating}
                                accept=".pdf,.md"
                            />

                            {#if uploadedFileName}
                                <p class="text-xs font-bold mt-1">
                                    {uploadedFileName}
                                </p>
                            {:else}
                                <p class="text-xs text-muted-foreground mt-1">
                                    Accepted formats: PDF, Markdown
                                </p>
                            {/if}
                            <Button
                                class="hover:bg-gray-300"
                                onclick={triggerFileUpload}
                                variant="secondary"
                                disabled={uploadState.loading ||
                                    uploadState.generating}
                            >
                                <Upload class="mr-2" />
                                Upload PDF or Markdown
                            </Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>

        <div class="flex flex-col justify-start mt-4 mb-12">
            <Button
                onclick={handleGenerateAll}
                disabled={uploadState.generating ||
                    !uploadState.caseId ||
                    !uploadState.uploadedFile}
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
                    !uploadState.caseId ||
                    !uploadState.uploadedFile}
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
                    !uploadState.caseId ||
                    !uploadState.uploadedFile}
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
                    !uploadState.caseId ||
                    !uploadState.uploadedFile}
            >
                {#if uploadState.isGeneratingDifferential}
                    Extracting Differential Diagnosis...
                {:else}
                    Generate Differential Diagnosis
                {/if}
            </Button>
            {#if (!uploadState.caseId || !uploadState.uploadedFile) && !uploadState.generating}
                <p class="text-xs mt-1 text-muted-foreground">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
    </div>

    <CaseData {uploadState} {currentTab} />
</div>
