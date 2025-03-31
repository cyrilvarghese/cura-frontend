<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import TestTube from "lucide-svelte/icons/test-tube";
    import { getRelativeTime } from "$lib/utils/time";
    import TestResultsTable from "./test-results-table.svelte";
    import MedicalImageViewer from "$lib/components/medical-image-viewer.svelte";
    import type { TestResult, TestResultContent } from "$lib/types";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { get } from "svelte/store";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import getFullImageUrl from "$lib/utils/getFullURl";

    const {
        result,
        caseId = get(currentCaseId) ?? get(lastCaseIdStore) ?? "",
    } = $props<{
        result: TestResult;
        caseId?: string;
    }>();

    const statusColors = {
        completed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        failed: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
    };

    function renderResult(
        result: TestResultContent,
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

    // Image error handling
    let imageErrorCount = 0;
    let hasImageError = $state(false);

    function handleImageError() {
        imageErrorCount++;
        console.log("Image error occurred");
        hasImageError = true;
        if (imageErrorCount > 3) {
            console.log("Too many images failed to load, hiding them");
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
            <Badge class={statusColors[result.status as keyof typeof statusColors]}>
                {result.status}
            </Badge>
        </div>
        <Card.Description class="mt-2">{result.purpose}</Card.Description>
    </Card.Header>
    <Card.Content class="grid gap-4">
        <div class="space-y-2 bg-amber-50/50 p-3 rounded-md">
            {#if typeof resultContent === "string"}
                <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                    {resultContent}
                </p>
            {:else if resultContent.type === "table"}
                <TestResultsTable
                    data={resultContent.content}
                    {caseId}
                    testName={result.testName}
                    testType="lab_test"
                />
            {:else if resultContent.type === "image"}
               
                    <MedicalImageViewer
                        {caseId}
                        testName={result.testName}
                        testType="lab_test"
                        imageUrls={Array.isArray(resultContent.content.url)
                            ? resultContent.content.url
                            : [resultContent.content.url]}
                        altText={resultContent.content.altText || ""}
                        caption={resultContent.content.caption}
                        subtitle={getRelativeTime(
                            result.timestamp ?? new Date(),
                        )}
                    />
             
            {:else if resultContent.type === "mixed"}
                <div class="space-y-4">
                    {#each resultContent.content as item}
                        {#if item.type === "text"}
                            <p
                                class="text-sm text-muted-foreground whitespace-pre-wrap"
                            >
                                <!-- {item.content}  remove this from student --> 
                            </p>
                        {:else if item.type === "table"}
                            <TestResultsTable
                                data={item.content}
                                {caseId}
                                testName={result.testName}
                                testType="lab_test"
                            />
                        {:else if item.type === "image"}
                            
                                <MedicalImageViewer
                                    {caseId}
                                    testName={result.testName}
                                    testType="lab_test"
                                    imageUrls={Array.isArray(item.content.url)
                                        ? item.content.url
                                        : [item.content.url]}
                                    altText={item.content.altText || ""}
                                    caption={item.content.caption}
                                    subtitle={getRelativeTime(
                                        result.timestamp ?? new Date(),
                                    )}
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
