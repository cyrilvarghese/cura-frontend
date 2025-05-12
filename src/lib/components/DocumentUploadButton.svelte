<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Upload, Loader2 } from "lucide-svelte";
    import { uploadDocuments } from "$lib/stores/documentStore";
    import { currentDepartment } from "$lib/stores/teamStore";
    import { toast } from "svelte-sonner";

    export let topicName: string;
    export let onSuccess: () => void;
    let isUploading = false;
    let totalFiles = 0;
    let currentFileIndex = 0;

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        if (!$currentDepartment) {
            toast.error("Please select a department first", {
                style: "background: white; color: rgb(220 38 38);",
            });
            return;
        }

        try {
            isUploading = true;
            totalFiles = input.files.length;

            const validFiles: Array<{
                file: File;
                title: string;
                description: string;
            }> = [];

            // Validate files first
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];

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
                    toast.error(
                        `Skipping ${file.name}: Please upload only PDF, image, or markdown files`,
                        {
                            style: "background: white; color: rgb(220 38 38);",
                        },
                    );
                    continue;
                }

                validFiles.push({
                    file,
                    title: file.name,
                    description: "", // You can modify this if needed
                });
            }

            if (validFiles.length === 0) {
                toast.error("No valid files to upload", {
                    style: "background: white; color: rgb(220 38 38);",
                });
                return;
            }

            const results = await uploadDocuments(
                validFiles,
                $currentDepartment.name,
                $currentDepartment.id,
            );

            if (results && results.length > 0) {
                toast.success(`Successfully uploaded ${results.length} files`, {
                    style: "background: white; color: rgb(22 163 74);",
                });
                onSuccess();
            }
        } catch (error) {
            // Error handling is done in documentService
        } finally {
            isUploading = false;
            currentFileIndex = 0;
            totalFiles = 0;
            // Clear the input value to allow uploading the same files again
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
        multiple
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
