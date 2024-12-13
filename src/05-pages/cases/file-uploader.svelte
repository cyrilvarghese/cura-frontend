<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Upload } from "lucide-svelte";

    let { caseId, uploadState, onFileUpload, onCaseIdChange } = $props();

    let uploadedFileName: string | null = $state(null);

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (!file.type.includes("pdf") && !file.type.includes("markdown") && !file.name.endsWith(".md")) {
            alert("Please upload a PDF or Markdown file only");
            return;
        }

        uploadedFileName = file.name;

        onFileUpload(file);
    }

    function triggerFileUpload() {
        const input = document.getElementById(
            "file-upload-input",
        ) as HTMLInputElement;
        input.click();
    }
</script>

<div class="flex w-full gap-4">
    <Card.Root class="max-w-md shadow-md rounded-lg bg-white w-[300px]">
        <Card.Header>
            <Card.Title class="text-lg font-semibold">Upload Patient Case Document</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="space-y-8">
                <div class="grid w-full items-center gap-1.5">
                    <label for="case-id" class="text-sm leading-none">Case ID</label>
                    <input
                        id="case-id"
                        type="text"
                        bind:value={caseId}
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Enter case ID"
                        disabled={uploadState.loading || uploadState.generating}
                        oninput={(e) => onCaseIdChange(e.currentTarget.value)}
                    />
                </div>

                <div class="grid w-full items-center gap-1.5">
                    <label for="file-upload" class="text-sm leading-none">Patient Case Document</label>
                    <input
                        id="file-upload-input"
                        type="file"
                        class="hidden"
                        onchange={handleFileUpload}
                        disabled={uploadState.loading || uploadState.generating}
                        accept=".pdf,.md"
                    />
                    <Button
                        class="hover:bg-gray-300"
                        onclick={triggerFileUpload}
                        variant="secondary"
                        disabled={uploadState.loading || uploadState.generating}
                    >
                        <Upload class="mr-2" />
                        Upload PDF or Markdown
                    </Button>
                    {#if uploadedFileName}
                        <p class="text-xs text-muted-foreground mt-1">
                            Uploaded: {uploadedFileName}
                        </p>
                    {:else}
                        <p class="text-xs text-muted-foreground mt-1">
                            Accepted formats: PDF, Markdown
                        </p>
                    {/if}
                </div>
            </div>
        </Card.Content>
    </Card.Root>
</div>
