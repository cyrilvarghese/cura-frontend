<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import { getRelativeTime } from "$lib/utils/time";
    import FindingsTable from "./findings-table.svelte";
    import MedicalImageViewer from "$lib/components/medical-image-viewer.svelte";
    import type { ExaminationResult, FindingContent } from "$lib/types/index";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { get } from "svelte/store";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { getContext } from "svelte";
    import { editPhysicalExamTableStore } from "$lib/stores/editTablePEStore";
    import CommentButton from "$lib/components/ui/comment-button.svelte";

    const caseId = get(currentCaseId) ?? get(lastCaseIdStore) ?? "";
    const { result } = $props<{
        result: ExaminationResult;
    }>();

    const caseType = getContext<"new" | "edit">("case-type"); // new or edit mode

    let comment = $state("");
    let isPopoverOpen = $state(false);

    function renderFinding(finding: FindingContent): string | FindingContent {
        switch (finding.type) {
            case "text":
                return finding.content;
            case "table":
                return finding;
            case "image":
                return finding;
            case "mixed":
                return finding;
            default:
                return "Unsupported finding type";
        }
    }

    const findingContent = renderFinding(result.findings as FindingContent);
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 border-l-blue-500/50 rounded-none rounded-r-md"
>
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Stethoscope class="h-5 w-5 text-blue-500/70" />
                <Card.Title class="pr-4">
                    {result.name}
                    {#if result.isVerified}
                        <span class="ml-1 text-green-600">✓</span>
                    {/if}
                </Card.Title>
            </div>
            <div class="flex items-center gap-2">
                {#if caseType === "edit"}
                    <CommentButton
                        {caseId}
                        testName={result.name}
                        testType="physical_exam"
                        initialCommentCount={result.comments?.length ?? 0}
                        initialComments={result.comments ?? []}
                    />
                {/if}
                <Badge
                    variant="secondary"
                    class="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
                >
                    Physical Exam
                </Badge>
            </div>
        </div>
        <Card.Description class="mt-2">{result.purpose}</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="space-y-2 bg-blue-50/50 p-3 rounded-md">
            <!-- <h4 class="font-medium leading-none text-blue-700">Findings</h4> -->
            {#if typeof findingContent === "string"}
                <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                    {findingContent}
                </p>
            {:else if findingContent.type === "table"}
                <FindingsTable
                    data={findingContent.content}
                    {caseId}
                    testName={result.name}
                    testType="physical_exam"
                />
            {:else if findingContent.type === "image"}
                <MedicalImageViewer
                    {caseId}
                    testName={result.name}
                    testType="physical_exam"
                    imageUrls={Array.isArray(findingContent.content.url)
                        ? findingContent.content.url
                        : [findingContent.content.url]}
                    altText={findingContent.content.altText}
                    caption={findingContent.content.caption}
                    subtitle={findingContent.content.altText}
                />
            {:else if findingContent.type === "mixed"}
                <div class="space-y-4">
                    {#each findingContent.content as item}
                        {#if item.type === "text"}
                            <!-- <p
                                class="text-sm text-muted-foreground whitespace-pre-wrap"
                            >
                                {item.content}
                            </p> -->
                        {:else if item.type === "table"}
                            <FindingsTable
                                data={item.content}
                                {caseId}
                                testName={result.name}
                                testType="physical_exam"
                            />
                        {:else if item.type === "image"}
                            <MedicalImageViewer
                                {caseId}
                                testName={result.name}
                                testType="physical_exam"
                                imageUrls={Array.isArray(item.content.url)
                                    ? item.content.url
                                    : [item.content.url]}
                                altText={item.content.altText}
                                caption={item.content.caption}
                                subtitle={item.content.altText}
                            />
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
    </Card.Content>
    <Card.Footer>
        <p class="text-sm text-muted-foreground">
            {getRelativeTime(result.timestamp ?? new Date())}
        </p>
    </Card.Footer>
</Card.Root>
