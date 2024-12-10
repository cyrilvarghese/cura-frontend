<script lang="ts">
    import { uploadService } from "$lib/services/uploadService";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import { cn } from "$lib/utils";
    import { marked } from "marked";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";

    interface FormattedResponse {
        id: string;
        content: string;
        timestamp: string;
        type: "ai";
    }

    let { class: className } = $props();

    const uploadState = $state({
        loading: false,
        error: null as string | null,
        progress: 0,
        response: null as FormattedResponse | null,
    });

    let caseId = $state("");

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        if (!caseId.trim()) {
            uploadState.error = "Please enter a Case ID";
            return;
        }

        const file = input.files[0];

        if (!file.type.includes("pdf")) {
            uploadState.error = "Please upload a PDF file only";
            return;
        }

        uploadState.loading = true;
        uploadState.error = null;
        uploadState.response = null;
        uploadState.progress = 0;

        try {
            const response = await uploadService.uploadFile(
                file,
                caseId.trim(),
            );
            uploadState.response = response;
            caseId = ""; // Direct assignment works with $state variables
            (event.target as HTMLInputElement).value = "";
        } catch (error) {
            uploadState.error =
                error instanceof Error ? error.message : "Upload failed";
        } finally {
            uploadState.loading = false;
        }
    }
</script>

<div class={cn("space-y-4 w-full overflow-auto", className)}>
    <div class="grid w-full items-center pb-4 gap-1.5">
        <label
            for="case-id"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            Case ID
        </label>
        <input
            id="case-id"
            type="text"
            bind:value={caseId}
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter case ID"
            disabled={uploadState.loading}
        />
    </div>

    <div class="grid w-full items-center gap-1.5">
        <label
            for="file-upload"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            Upload Patient Case Document (PDF only)
        </label>

        <input
            id="file-upload"
            type="file"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onchange={handleFileUpload}
            disabled={uploadState.loading}
            accept=".pdf"
        />

        <p class="text-xs text-muted-foreground mt-1">Accepted format: PDF</p>
    </div>

    {#if uploadState.loading}
        <div class="space-y-4">
            <LoadingMessage message="Creating patient persona" />
        </div>
    {/if}

    {#if uploadState.error}
        <Alert variant="destructive">
            <AlertDescription>
                {uploadState.error}
            </AlertDescription>
        </Alert>
    {/if}

    {#if uploadState.response}
        <div
            class="rounded-lg border overflow-auto bg-card text-card-foreground shadow-sm p-4 w-full"
        >
            <div class="flex justify-between items-start mb-2">
                <time class="text-xs text-muted-foreground">
                    {new Date(uploadState.response.timestamp).toLocaleString()}
                </time>
            </div>
            <div class="prose prose-sm dark:prose-invert max-w-none">
                {@html marked(uploadState.response.content)}
            </div>
        </div>
    {/if}
</div>

<style>
    /* Add Tailwind Typography styles for markdown content */
    :global(.prose) {
        max-width: none;
    }
    :global(.prose p) {
        margin-top: 1em;
        margin-bottom: 1em;
    }
    :global(.prose ul) {
        list-style-type: disc;
        padding-left: 1.5em;
    }
    :global(.prose ol) {
        list-style-type: decimal;
        padding-left: 1.5em;
    }
</style>
