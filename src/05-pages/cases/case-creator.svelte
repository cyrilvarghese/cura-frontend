<script lang="ts">
    import FileUploader from "./file-uploader.svelte";
    import CaseData from "./case-data.svelte";
    import { Button } from "$lib/components/ui/button";
    import { uploadService } from "$lib/services/uploadService";
    import type { FormattedPersonaResponse } from "$lib/types";

    interface FormattedResponse {
        id: string;
        content: string;
        timestamp: string;
        type: "ai";
    }

    let caseId = "";
    let uploadState = {
        loading: false,
        generating: false,
        error: null as string | null,
        response: null as FormattedResponse | null,
        fileUploaded: false,
    };
    let uploadedFile: File | null = null;

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
            const response: FormattedPersonaResponse = await uploadService.uploadFile(uploadedFile, caseId);
            uploadState.response = {
                id: response.id,
                content: response.content,
                timestamp: new Date().toISOString(),
                type: "ai",
            };
        } catch (error) {
            uploadState.error = error instanceof Error ? error.message : "Generation failed";
        } finally {
            uploadState.generating = false;
        }
    }
</script>

<div class="flex flex-row items-start justify-start gap-4">
    <div class="flex flex-col gap-4 w-full">
        <FileUploader
            {caseId}
            {uploadState}
            onFileUpload={handleFileUpload}
            onCaseIdChange={handleCaseIdChange}
        />
        
        {#if uploadState.fileUploaded}
            <div class="flex justify-start w-[200px]">
                <Button
                    onclick={handleGeneratePersona}
                    disabled={uploadState.generating}
                >
                    {#if uploadState.generating}
                        Generating...
                    {:else}
                        Generate Persona
                    {/if}
                </Button>
            </div>
        {/if}
    </div>
    
    <CaseData {uploadState} />
</div>
