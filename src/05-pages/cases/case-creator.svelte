<script lang="ts">
    import FileUploader from "./file-uploader.svelte";
    import CaseData from "./case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import { caseStore, generatePersona, generatePhysicalExam , type CaseStoreState} from "$lib/stores/caseStore";
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
    };

    let caseId = $state("");
    let uploadState = $state(initialValue);
    let uploadedFile = $state<File | null>(null);

 

    // Subscribe to the caseStore
    const unsubscribe = caseStore.subscribe(state => {
        debugger
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
        caseId = newCaseId;
    }

    async function handleGeneratePersona() {
        if (!uploadedFile || !caseId.trim()) return;

        uploadState.generating = true;
        uploadState.error = null;

        try {
            await generatePersona(
                uploadedFile,
                caseId,
            );
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Generation failed";
        } finally {
            uploadState.generating = false;
        }
    }

    async function handleGeneratePhysicalExam() {
        console.log("Generating Physical Exam");
        if (!uploadedFile || !caseId.trim()) return;

        try {
            await generatePhysicalExam(uploadedFile, caseId);
        } catch (error) {
            console.error("Error generating physical exam:", error);
        }
    }
</script>

<div class="flex flex-row items-start justify-start gap-4">
    <div>
        <FileUploader
            {caseId}
            {uploadState}
            onFileUpload={handleFileUpload}
            onCaseIdChange={handleCaseIdChange}
        />

        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGeneratePersona}
                disabled={uploadState.generating ||
                    !caseId.trim() ||
                    !uploadedFile}
            >
                {#if uploadState.generating}
                    Generating...
                {:else}
                    Generate Patient Persona
                {/if}
            </Button>
            {#if !caseId.trim() || !uploadedFile}
                <p class="text-xs mt-1 text-red-500">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
        <div class="flex flex-col justify-start mt-4">
            <Button
                onclick={handleGeneratePhysicalExam}
                disabled={uploadState.generating ||
                    !caseId.trim() ||
                    !uploadedFile}
            >
                {#if uploadState.generating}
                    Generating...
                {:else}
                    Generate Physical Exam Data
                {/if}
            </Button>
            {#if !caseId.trim() || !uploadedFile}
                <p class="text-xs mt-1 text-red-500">
                    Please fill in all fields and upload a PDF file
                </p>
            {/if}
        </div>
    </div>

    <CaseData {uploadState} />
</div>
