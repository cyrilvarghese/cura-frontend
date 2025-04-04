<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Upload, Loader2 } from "lucide-svelte";
    import { uploadDocument } from "$lib/stores/documentStore";
    import { currentDepartment } from "$lib/stores/teamStore";
    import { toast } from "svelte-sonner";

    export let topicName: string;
    export let onSuccess: () => void;
    let isUploading = false;

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        // Check if department is selected
        if (!$currentDepartment) {
            toast.error("Please select a department first", {
                style: "background: white; color: rgb(220 38 38);",
            });
            return;
        }

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
            toast.error("Please upload a PDF, image, or markdown file", {
                style: "background: white; color: rgb(220 38 38);",
            });
            return;
        }

        try {
            isUploading = true;
            const result = await uploadDocument(
                file,
                $currentDepartment.name,
                file.name,
                "",
            );
            if (result) {
                onSuccess();
            }
        } catch (error) {
            // Error handling is done in documentService
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
        variant="default"
        class="flex items-center gap-2"
        onclick={() => document.getElementById(`file-${topicName}`)?.click()}
        disabled={isUploading || !$currentDepartment}
    >
        {#if isUploading}
            <Loader2 class="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
        {:else}
            <Upload class="h-4 w-4" />
            <span>Add {topicName}</span>
        {/if}
    </Button>
</div>
