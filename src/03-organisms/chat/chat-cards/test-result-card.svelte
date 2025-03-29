<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import TestTube from "lucide-svelte/icons/test-tube";
    import { getRelativeTime } from "$lib/utils/time";
    import TestResultsTable from "./test-results-table.svelte";
    import MedicalImageViewer from "$lib/components/medical-image-viewer.svelte";
    import type { TestResult, TestResultContent } from '$lib/types';
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { get } from "svelte/store";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    
    export let result: TestResult;
   
    debugger;
    export let caseId: string = get(currentCaseId) ?? get(lastCaseIdStore) ?? "";
    
    const statusColors = {
        completed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        failed: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
    };

    function renderResult(
        result: TestResultContent
    ): string | TestResultContent {
        switch (result.type) {
            case "text":
                return result.content;
            case "table":
                return result;
            case "image":
                return result;
            case "mixed":
                return result;
            default:
                return "Unsupported result type";
        }
    }
    
    

    const resultContent = renderResult(result.results);
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 border-l-amber-900/50 rounded-none rounded-r-md"
>
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <TestTube class="h-5 w-5 text-amber-900/70" />
                <Card.Title class="pr-4">{result.testName}</Card.Title>
            </div>
            <Badge class={statusColors[result.status]}>
                {result.status}
            </Badge>
        </div>
        <Card.Description class="mt-2">{result.purpose}</Card.Description>
    </Card.Header>
    <Card.Content class="grid gap-4">
        <div class="space-y-2 bg-amber-50/50 p-3 rounded-md">
            <h4 class="font-medium leading-none text-amber-900">Results</h4>
            {#if typeof resultContent === "string"}
                <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                    {resultContent}
                </p>
            {:else if resultContent.type === "table"}
                <TestResultsTable data={resultContent.content} caseId={caseId} testName={result.testName} testType="lab_test" />
            {:else if resultContent.type === "image"}
        
                <MedicalImageViewer
                    imageUrl={resultContent.content.url}
                    altText=""
                    caption={resultContent.content.caption}
                    subtitle={getRelativeTime(result.timestamp ?? new Date())}
                    caseId={caseId}
                    testName={result.testName}
                    testType="lab_test"
                    onUploadSuccess={(response) => {
                        // Handle successful upload
                        console.log('Upload successful:', response);
                        // Update your UI with the new image URL
                    }}
                />
            {:else if resultContent.type === "mixed"}
                <div class="space-y-4">
                    {#each resultContent.content as item}
                        {#if item.type === "text"}
                            <p
                                class="text-sm text-muted-foreground whitespace-pre-wrap"
                            >
                                {item.content}
                            </p>
                        {:else if item.type === "table"}
                            <TestResultsTable data={item.content} />
                        {:else if item.type === "image"}
                            <MedicalImageViewer
                                imageUrl={item.content.url}
                                altText={item.content.altText}
                                caption={item.content.caption}
                                subtitle={getRelativeTime(result.timestamp ?? new Date())}
                                caseId={caseId}
                                testName={result.testName}
                                testType="lab_test"
                                onUploadSuccess={(response) => {
                                    // Handle successful upload
                                    console.log('Upload successful:', response);
                                    // Update your UI with the new image URL
                                }}
                            />
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
        <!-- {#if result.interpretation}
            <div class="space-y-2">
                <h4 class="font-medium leading-none text-amber-900">
                    Interpretation
                </h4>
                <p class="text-sm text-muted-foreground">
                    {result.interpretation}
                </p>
            </div>
        {/if} -->
    </Card.Content>
    <Card.Footer>
        <p class="text-sm text-muted-foreground">
            {getRelativeTime(result.timestamp ?? new Date())}
        </p>
    </Card.Footer>
</Card.Root>
