<script lang="ts">
    import FileUploader from "./file-uploader.svelte";
    import CaseData from "./case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import {
        caseStore,
        generatePersona,
        generatePhysicalExam,
        generateCoverImage,
        type CaseStoreState,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy } from "svelte";

    // Define initialValue based on the expected structure of CaseStoreState
    const initialValue: CaseStoreState = {
        fileUploaded: false,
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
    };

    let uploadState = $state(initialValue);
    let uploadedFile = $state<File | null>(null);
    let currentTab = $state<
        | "patient-persona"
        | "physical-exams"
        | "lab-results"
        | "case-summary"
        | "cover-image"
        | "examination-editor"
    >("patient-persona");

    // Subscribe to the caseStore
    const unsubscribe = caseStore.subscribe((state) => {
        uploadState = state;
    });

    onDestroy(() => {
        unsubscribe(); // Clean up the subscription when the component is destroyed
    });

    function handleFileUpload(file: File) {
        uploadedFile = file;
        uploadState.fileUploaded = true;
    }

    function handleCaseIdChange(newCaseId: string) {
        uploadState.caseId = newCaseId;
        console.log(uploadState.caseId);
    }

    async function handleGeneratePersona() {
        if (!uploadedFile || !uploadState.caseId) return;
        $: currentTab = "patient-persona";

        uploadState.generating = true;
        uploadState.error = null;

        try {
            await generatePersona(uploadedFile, uploadState.caseId);
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
        } finally {
            uploadState.generating = false;
        }
    }

    async function handleGeneratePhysicalExam() {
        $: currentTab = "physical-exams";

        console.log("Generating Physical Exam");
        if (!uploadedFile || !uploadState.caseId) return;

        try {
            await generatePhysicalExam(uploadedFile, uploadState.caseId);
        } catch (error) {
            console.error("Error generating physical exam:", error);
        }
    }

    async function handleGenerateCoverImage() {
        $: currentTab = "cover-image";
        if (!uploadedFile || !uploadState.caseId) return;

        try {
            await generateCoverImage(uploadState.caseId);
        } catch (error) {
            console.error("Error generating cover image:", error);
        }
    }
</script>

<div class="flex flex-row items-start justify-start gap-4">
    <div>
        <FileUploader
            caseId={uploadState.caseId}
            {uploadState}
            onFileUpload={handleFileUpload}
            onCaseIdChange={handleCaseIdChange}
        />

        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGeneratePersona}
                disabled={uploadState.generating ||
                    !uploadState.caseId ||
                    !uploadedFile}
            >
                {#if uploadState.generating}
                    Generating...
                {:else}
                    Generate Patient Persona
                {/if}
            </Button>
            {#if !uploadState.caseId || !uploadedFile}
                <p class="text-xs mt-1 text-red-500">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGeneratePhysicalExam}
                disabled={uploadState.generating ||
                    !uploadState.caseId ||
                    !uploadedFile}
            >
                {#if uploadState.generating}
                    Generating...
                {:else}
                    Generate Physical Exam Data
                {/if}
            </Button>
            {#if !uploadState.caseId || !uploadedFile}
                <p class="text-xs mt-1 text-red-500">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGenerateCoverImage}
                disabled={uploadState.generating ||
                    !uploadState.caseId ||
                    !uploadedFile}
            >
                {#if uploadState.generating}
                    Generating...
                {:else}
                    Generate Cover Image
                {/if}
            </Button>
            {#if !uploadState.caseId || !uploadedFile}
                <p class="text-xs mt-1 text-red-500">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
    </div>

    <CaseData {uploadState} {currentTab}   />
</div>
