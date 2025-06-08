<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import ScanEye from "lucide-svelte/icons/scan-eye";
    import Edit from "lucide-svelte/icons/edit";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import Search from "lucide-svelte/icons/search";
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
    import { convertAsteriskToBold } from "$lib/utils/text";
    import { editExamStore } from "$lib/stores/editExamStore";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { authStore, type AuthState } from "$lib/stores/authStore";
    import {
        previewImageSearch,
        executeImageSearch,
        clearImageSearch,
        imageSearchStore,
    } from "$lib/stores/imageSearchStore";
    import ImageSearchModal from "$lib/components/ui/image-search-modal.svelte";

    const {
        result,
        caseId = get(currentCaseId) ?? get(lastCaseIdStore) ?? "",
        onDelete,
        onEdit,
    } = $props<{
        result: ExaminationResult;
        caseId?: string;
        onDelete?: (examName: string) => void;
        onEdit?: (examName: string, updatedData: any) => void;
    }>();

    const caseType = getContext<"new" | "edit">("case-type"); // new or edit mode

    let user: AuthState["user"] | undefined = $state();

    authStore.subscribe((state) => {
        user = state.user;
    });

    function renderFinding(finding: FindingContent): string | FindingContent {
        switch (finding.type) {
            case "text":
                return convertAsteriskToBold(finding.content);
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

    const findingContent = $derived(
        renderFinding(result.findings as FindingContent),
    );
    let deleteConfirmOpen = $state(false);
    let searchModalOpen = $state(false);
    let currentSearchQuery = $state<any>(null);
    let lastSearchedTestName = $state<string>("");

    // Get search state without reactive derivation to avoid loops
    let searchState = $state($imageSearchStore);

    // Handler functions for edit, delete, and search
    function handleEdit() {
        console.log("Edit examination:", result.name);
        // Call the callback to notify parent component
        onEdit?.(result.name, result);
    }

    function handleDelete() {
        deleteConfirmOpen = true;
    }

    async function handleSearch() {
        console.log("Search examination:", result.name);

        // If this is a different test than the last searched one, clear the state
        if (lastSearchedTestName !== result.name) {
            clearImageSearch();
            searchState = {
                isLoading: false,
                preview: null,
                results: null,
                error: null,
                query: null,
            };
            lastSearchedTestName = result.name;
        }

        const searchQuery = {
            case_id: caseId,
            test_type: "physical_exam" as const,
            test_name: result.name,
            max_results: 30,
            search_depth: "advanced" as const,
        };

        currentSearchQuery = searchQuery;
        searchModalOpen = true;

        // Only call API if we don't already have results for this test
        if (!searchState.results) {
            // Set loading state immediately when starting search
            searchState = { ...searchState, isLoading: true };

            try {
                await executeImageSearch(searchQuery);
                // Update search state after search completes
                searchState = $imageSearchStore;
            } catch (error) {
                console.error("Failed to search images:", error);
                // Update search state even on error
                searchState = $imageSearchStore;
            }
        }
    }

    const handleModalSearch = async (query: any) => {
        // Set loading state for retry search
        searchState = { ...searchState, isLoading: true };

        try {
            await executeImageSearch(query);
            // Update search state after search completes
            searchState = $imageSearchStore;
        } catch (error) {
            console.error("Failed to retry search:", error);
            // Update search state even on error
            searchState = $imageSearchStore;
        }
    };

    async function confirmDelete() {
        deleteConfirmOpen = false;

        try {
            await editExamStore.deletePhysicalExam({
                case_id: caseId,
                test_name: result.name,
            });

            // Call the callback to notify parent component
            onDelete?.(result.name);

            console.log("Examination deleted successfully");
        } catch (error) {
            console.error("Failed to delete examination:", error);
        }
    }
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 {typeof findingContent === 'object' &&
    findingContent.type === 'mixed'
        ? 'border-l-red-500/50'
        : 'border-l-blue-500/50'} rounded-none rounded-r-md p-4 pt-0"
>
    <Card.Header class="pb-4">
        <div class="flex items-center justify-between">
            <div class="flex flex-col gap-2">
                <Badge
                    variant="secondary"
                    class="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 px-3 py-1 w-fit"
                >
                    Physical Exam
                </Badge>
                <div class="flex items-center gap-3">
                    <ScanEye class="h-5 w-5 text-blue-500/70" />
                    <Card.Title class="pr-4 capitalize text-lg">
                        {result.name}
                        {#if result.isVerified}
                            <span class="ml-2 text-green-600">✓</span>
                        {/if}
                    </Card.Title>
                </div>
            </div>
            <div class="flex items-center gap-2">
                {#if user?.role === "admin" && caseType === "edit"}
                    {#if typeof findingContent === "object" && findingContent.type === "mixed"}
                        <Button
                            variant="ghost"
                            size="sm"
                            class="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Search in examination"
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
                    testName={result.name}
                    testType="physical_exam"
                    initialCommentCount={result.comments?.length ?? 0}
                    initialComments={result.comments ?? []}
                />
            </div>
        </div>
        {#if caseType === "edit" || caseType === "new"}
            <Card.Description class="mt-3 text-sm leading-relaxed"
                >{result.purpose}</Card.Description
            >
        {/if}
    </Card.Header>
    <Card.Content class="py-4">
        <div class="space-y-3 p-4 rounded-lg">
            <!-- <h4 class="font-medium leading-none text-blue-700">Findings</h4> -->
            {#if typeof findingContent === "string"}
                <p
                    class="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed"
                >
                    {@html findingContent}
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
    <Card.Footer class="pt-4">
        <p class="text-sm text-muted-foreground">
            {getRelativeTime(result.timestamp ?? new Date())}
        </p>
    </Card.Footer>
</Card.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteConfirmOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete examination?</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to delete "{result.name}"? This action
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
<ImageSearchModal
    open={searchModalOpen}
    onOpenChange={(open: boolean) => (searchModalOpen = open)}
    initialQuery={currentSearchQuery || { search_query: "" }}
    {searchState}
    onSearch={handleModalSearch}
/>
