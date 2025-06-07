<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import TestTube from "lucide-svelte/icons/test-tube";
    import Edit from "lucide-svelte/icons/edit";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import Search from "lucide-svelte/icons/search";
    import { getRelativeTime } from "$lib/utils/time";
    import TestResultsTable from "./test-results-table.svelte";
    import MedicalImageViewer from "$lib/components/medical-image-viewer.svelte";
    import type { TestResult, TestResultContent } from "$lib/types/index";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { get } from "svelte/store";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import CommentButton from "$lib/components/ui/comment-button.svelte";
    import { getContext } from "svelte";
    import { editExamStore } from "$lib/stores/editExamStore";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { authStore, type AuthState } from "$lib/stores/authStore";
    import {
        previewImageSearch,
        executeImageSearch,
        imageSearchStore,
    } from "$lib/stores/imageSearchStore";
    import ImageSearchModal from "$lib/components/ui/image-search-modal.svelte";

    const {
        result,
        caseId = get(currentCaseId) ?? get(lastCaseIdStore) ?? "",
        onDelete,
        onEdit,
    } = $props<{
        result: TestResult;
        caseId?: string;
        onDelete?: (testName: string) => void;
        onEdit?: (testName: string, updatedData: any) => void;
    }>();

    const caseType = getContext<"new" | "edit">("case-type");

    let user: AuthState["user"] | undefined = $state();

    authStore.subscribe((state) => {
        user = state.user;
    });

    const statusColors = {
        completed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        failed: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
    };

    function renderResult(
        result: TestResultContent,
    ): string | TestResultContent {
        $inspect(result);
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

    const resultContent = $derived(renderResult(result.results));

    let deleteConfirmOpen = $state(false);
    let searchModalOpen = $state(false);
    let currentSearchQuery = $state<any>(null);

    // Use derived state from the store
    const searchState = $derived($imageSearchStore);

    // Handler functions for edit and delete
    function handleEdit() {
        console.log("Edit lab test:", result.testName);
        // Call the callback to notify parent component
        onEdit?.(result.testName, result);
    }

    function handleDelete() {
        deleteConfirmOpen = true;
    }

    async function handleSearch() {
        console.log("Search lab test:", result.testName);

        const searchQuery = {
            case_id: caseId,
            test_type: "lab_test" as const,
            test_name: result.testName,
            max_results: 30,
            search_depth: "advanced" as const,
        };

        currentSearchQuery = searchQuery;
        searchModalOpen = true;

        try {
            await executeImageSearch(searchQuery);
        } catch (error) {
            console.error("Failed to search images:", error);
        }
    }

    const handleModalSearch = async (query: any) => {
        await executeImageSearch(query);
    };

    async function confirmDelete() {
        deleteConfirmOpen = false;

        try {
            await editExamStore.deleteLabTest({
                case_id: caseId,
                test_name: result.testName,
            });

            // Call the callback to notify parent component
            onDelete?.(result.testName);

            console.log("Lab test deleted successfully");
        } catch (error) {
            console.error("Failed to delete lab test:", error);
        }
    }
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 {typeof resultContent === 'object' &&
    resultContent.type === 'mixed'
        ? 'border-l-red-500/50'
        : 'border-l-amber-900/50'} rounded-none rounded-r-md"
>
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <TestTube class="h-5 w-5 text-amber-900/70" />
                <Card.Title class="pr-4 capitalize">
                    {result.testName}
                    {#if result.isVerified}
                        <span class="ml-1 text-green-600">✓</span>
                    {/if}
                </Card.Title>
            </div>
            <div class="flex items-center gap-2">
                {#if user?.role === "admin" && caseType === "edit"}
                    {#if typeof resultContent === "object" && resultContent.type === "mixed"}
                        <Button
                            variant="ghost"
                            size="sm"
                            class="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Search in lab test"
                            onclick={handleSearch}
                        >
                            <Search class="h-4 w-4" />
                        </Button>
                    {/if}

                    <Button
                        variant="ghost"
                        size="sm"
                        class="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onclick={handleEdit}
                    >
                        <Edit class="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        class="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onclick={handleDelete}
                    >
                        <Trash2 class="h-4 w-4" />
                    </Button>
                {/if}

                <CommentButton
                    {caseId}
                    testName={result.testName}
                    testType="lab_test"
                    initialCommentCount={result.total_comments ?? 0}
                    initialComments={result.comments ?? []}
                />

                <Badge
                    class={statusColors[
                        result.status as keyof typeof statusColors
                    ]}
                >
                    {result.status}
                </Badge>
            </div>
        </div>
        {#if caseType === "edit"}
            <Card.Description class="mt-2">{result.purpose}</Card.Description>
        {/if}
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
                    subtitle={getRelativeTime(result.timestamp ?? new Date())}
                />
            {:else if resultContent.type === "mixed"}
                <div class="space-y-4">
                    {#each resultContent.content as item}
                        {#if item.type === "text"}
                            <p
                                class="text-sm text-muted-foreground whitespace-pre-wrap"
                            >
                                <!-- {item.content} -->
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

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteConfirmOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete lab test?</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to delete "{result.testName}"? This action
                cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action class="bg-destructive" onclick={confirmDelete}>
                Delete
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<!-- Image Search Modal -->
{#if currentSearchQuery}
    <ImageSearchModal
        bind:open={searchModalOpen}
        onOpenChange={(open: boolean) => (searchModalOpen = open)}
        initialQuery={currentSearchQuery}
        {searchState}
        onSearch={handleModalSearch}
    />
{/if}
