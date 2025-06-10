<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import {
        executeImageSearch,
        clearImageSearch,
        type ImageSearchState,
    } from "$lib/stores/imageSearchStore";
    import type {
        ImageSearchQuery,
        ImageSearchResult,
    } from "$lib/services/imageSearchService";
    import { Search, ExternalLink, RefreshCw } from "lucide-svelte";

    interface Props {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        initialQuery: ImageSearchQuery;
        searchState: ImageSearchState;
        onSearch?: (query: ImageSearchQuery) => Promise<void>;
    }

    let { open, onOpenChange, initialQuery, searchState, onSearch }: Props =
        $props();

    let isRetrying = $state(false);
    let queryText = $state("");

    // Initialize query text from search query when modal opens
    $effect(() => {
        if (open) {
            // Set query text from the actual search query or generated query
            queryText =
                searchState.results?.generated_query ||
                initialQuery.search_query ||
                "";
        }
    });

    // Clear state when modal closes
    $effect(() => {
        if (!open) {
            // Clear search state
            clearImageSearch();
            // Reset local state
            queryText = "";
            isRetrying = false;
            console.log("Image search modal closed - State cleared");
        }
    });

    const handleRetrySearch = async () => {
        if (!queryText.trim()) return;

        isRetrying = true;
        try {
            const retryQuery: ImageSearchQuery = {
                ...initialQuery,
                search_query: queryText,
            };

            if (onSearch) {
                await onSearch(retryQuery);
            } else {
                await executeImageSearch(retryQuery);
            }
        } catch (error) {
            console.error("Failed to retry search:", error);
        } finally {
            isRetrying = false;
        }
    };
</script>

<Dialog.Root {open} {onOpenChange}>
    <Dialog.Content class="max-w-6xl max-h-[90vh] overflow-hidden">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                <Search class="w-5 h-5" />
                Medical Image Search Results
            </Dialog.Title>
            {#if searchState.results}
                <Dialog.Description>
                    <div class="space-y-2 text-sm">
                        <p>
                            <strong>Diagnosis:</strong>
                            {searchState.results.primary_diagnosis}
                        </p>
                        <p>
                            <strong>Context:</strong>
                            {searchState.results.search_context}
                        </p>
                        <p>
                            <strong>Found:</strong>
                            {searchState.results.total_images} images, {searchState
                                .results.total_results} articles
                        </p>
                        <p>
                            <strong>Processing time:</strong>
                            {searchState.results.response_time}s
                        </p>
                    </div>
                </Dialog.Description>
            {/if}
        </Dialog.Header>

        <div class="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <!-- Search Query Editor -->
            <div class="space-y-3">
                <label class="text-sm font-medium">Search Query:</label>
                <div class="flex gap-2">
                    <textarea
                        bind:value={queryText}
                        placeholder="Enter or edit search query..."
                        class="flex-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={searchState.isLoading || isRetrying}
                    ></textarea>
                    <Button
                        onclick={handleRetrySearch}
                        disabled={searchState.isLoading ||
                            isRetrying ||
                            !queryText.trim()}
                        class="self-start"
                        variant="outline"
                    >
                        {#if isRetrying}
                            <RefreshCw class="w-4 h-4 animate-spin mr-2" />
                            Searching...
                        {:else}
                            <Search class="w-4 h-4 mr-2" />
                            Retry Search
                        {/if}
                    </Button>
                </div>
            </div>

            <!-- Loading State -->
            {#if searchState.isLoading && !searchState.results}
                <div
                    class="flex flex-col items-center justify-center py-12 space-y-4"
                >
                    <div
                        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                    ></div>
                    <p class="text-sm text-gray-600">
                        Searching medical images and articles...
                    </p>
                    <p class="text-xs text-gray-500">
                        This may take a few moments
                    </p>
                </div>
            {/if}

            {#if searchState.results}
                <!-- Images Grid -->
                {#if searchState.results.images.length > 0}
                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold">
                            Medical Images ({searchState.results.total_images})
                        </h3>
                        <div
                            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            {#each searchState.results.images as image, index}
                                <a
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="group cursor-pointer block"
                                >
                                    <div
                                        class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.description}
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            loading="lazy"
                                        />
                                        <div
                                            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                                        >
                                            <ExternalLink
                                                class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>
                                    <p
                                        class="mt-2 text-xs text-gray-600 line-clamp-2"
                                    >
                                        {image.description}
                                    </p>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Related Articles -->
                {#if searchState.results.results.length > 0}
                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold">
                            Related Articles ({searchState.results
                                .total_results})
                        </h3>
                        <div class="space-y-3">
                            {#each searchState.results.results as article}
                                <div
                                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        class="flex justify-between items-start gap-4"
                                    >
                                        <div class="flex-1">
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="text-left hover:text-blue-600 transition-colors block"
                                            >
                                                <h4
                                                    class="font-medium text-blue-700 hover:underline"
                                                >
                                                    {article.title}
                                                </h4>
                                            </a>
                                            <p
                                                class="mt-2 text-sm text-gray-600 line-clamp-3"
                                            >
                                                {article.content}
                                            </p>
                                            <div
                                                class="mt-2 flex items-center gap-2 text-xs text-gray-500"
                                            >
                                                <span
                                                    >Relevance: {Math.round(
                                                        article.score * 100,
                                                    )}%</span
                                                >
                                                <span>•</span>
                                                <span class="truncate"
                                                    >{article.url}</span
                                                >
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="shrink-0"
                                            asChild
                                        >
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink class="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Processing Metadata -->
                {#if searchState.results.processing_metadata}
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                        <h3 class="text-sm font-semibold text-gray-700">
                            Search Details
                        </h3>
                        <div
                            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600"
                        >
                            <div>
                                <p>
                                    <strong>Keywords:</strong>
                                    {searchState.results.processing_metadata.medical_keywords?.join(
                                        ", ",
                                    ) || "N/A"}
                                </p>
                                <p>
                                    <strong>Model:</strong>
                                    {searchState.results.processing_metadata
                                        .gemini_model || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <strong>Alternative contexts:</strong>
                                    {searchState.results.processing_metadata.alternative_contexts?.join(
                                        ", ",
                                    ) || "N/A"}
                                </p>
                                <p>
                                    <strong>Search depth:</strong>
                                    {searchState.results.processing_metadata
                                        .tavily_search_depth}
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}

            {#if searchState.error}
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-700 text-sm">
                        <strong>Error:</strong>
                        {searchState.error}
                    </p>
                </div>
            {/if}

            <!-- Retry Loading State -->
            {#if isRetrying}
                <div
                    class="flex flex-col items-center justify-center py-8 space-y-3"
                >
                    <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                    ></div>
                    <p class="text-sm text-gray-600">
                        Retrying search with updated query...
                    </p>
                </div>
            {/if}
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => onOpenChange(false)}>
                Close
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Loading Overlay -->
<!-- <LoadingOverlay
    message={isRetrying ? "Retrying search..." : "Searching medical images..."}
    isVisible={searchState.isLoading || isRetrying}
/> -->

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
