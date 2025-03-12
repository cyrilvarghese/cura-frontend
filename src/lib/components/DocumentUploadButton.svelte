<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Upload, Loader2 } from "lucide-svelte";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import { uploadDocument } from "$lib/stores/documentStore";

    export let topicName: string;

    let uploadError = "";
    let showAlert = false;
    let isUploading = false;

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const isMarkdown =
            file.name.toLowerCase().endsWith(".md") ||
            file.name.toLowerCase().endsWith(".markdown") ||
            file.type.includes("text/markdown") ||
            file.type.includes("text/x-markdown");

        if (
            !file.type.includes("pdf") &&
            !file.type.includes("image/") &&
            !isMarkdown
        ) {
            uploadError = "Please upload a PDF, image, or markdown file";
            showAlert = true;
            setTimeout(() => (showAlert = false), 3000);
            return;
        }

        try {
            isUploading = true;
            await uploadDocument(file, topicName, file.name, "");
            showAlert = false;
        } catch (error) {
            uploadError =
                error instanceof Error ? error.message : "Upload failed";
            showAlert = true;
        } finally {
            isUploading = false;
            // Clear the input value to allow uploading the same file again
            (event.target as HTMLInputElement).value = "";
        }
    }
</script>

<div class="relative">
    <input
        type="file"
        id="file-{topicName}"
        class="hidden"
        accept="*"
        onchange={handleFileUpload}
    />
    <Button
        variant="outline"
        size="icon"
        class="h-8 w-8 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-blue-600"
        onclick={() => document.getElementById(`file-${topicName}`)?.click()}
        disabled={isUploading}
    >
        {#if isUploading}
            <Loader2 class="h-4 w-4 animate-spin" />
            <span class="sr-only">Uploading...</span>
        {:else}
            <Upload class="h-4 w-4" />
        {/if}
    </Button>
    {#if isUploading}
        <span
            class="absolute left-full ml-2 whitespace-nowrap text-sm text-blue-600"
        >
            Uploading...
        </span>
    {/if}
</div>

{#if showAlert}
    <Alert
        variant="destructive"
        class="fixed top-4 right-4 w-auto bg-red-50/80 backdrop-blur-sm border border-red-200 shadow-lg animate-in slide-in-from-top-5"
    >
        <AlertDescription class="text-red-600">{uploadError}</AlertDescription>
    </Alert>
{/if}
