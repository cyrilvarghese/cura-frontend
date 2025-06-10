<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Search, ExternalLink } from "lucide-svelte";
    import {
        executeImageSearch,
        clearImageSearch,
        imageSearchStore,
        type ImageSearchState,
    } from "$lib/stores/imageSearchStore";
    import type { ImageSearchQuery } from "$lib/services/imageSearchService";
    import { onMount } from "svelte";

    interface Props {
        open: boolean;
        caseId: string;
        testName: string;
        testType: "physical_exam" | "lab_test";
        findingString: string;
    }

    let {
        open = $bindable(),
        caseId,
        testName,
        testType,
        findingString,
    }: Props = $props();

    let searchState: ImageSearchState = $state({
        isLoading: false,
        preview: null,
        results: null,
        error: null,
        query: null,
    });

    let hasTriggeredSearch = false;
    let editableFindingString = $state("");
    let serpApiKey = $state("");
    let accumulatedImages = $state<any[]>([]);
    let isHeaderCollapsed = $state(false);

    // Subscribe to store updates
    onMount(() => {
        const unsubscribe = imageSearchStore.subscribe((state) => {
            searchState = { ...state };
            // Accumulate images when new results come in
            if (state.results?.images && hasTriggeredSearch) {
                const newImages = state.results.images.filter(
                    (newImg) =>
                        !accumulatedImages.some(
                            (existingImg) => existingImg.url === newImg.url,
                        ),
                );
                accumulatedImages = [...accumulatedImages, ...newImages];
            }
            editableFindingString = state.results?.search_context || "";
        });
        return unsubscribe;
    });

    // Simple effect to handle modal open/close
    $effect(() => {
        if (open && !hasTriggeredSearch) {
            // Modal is opening - clear state and trigger search
            clearImageSearch();
            accumulatedImages = [];

            // Load SerpAPI key from localStorage
            if (typeof window !== "undefined") {
                const savedSerpKey = localStorage.getItem("serpApiKey");
                if (savedSerpKey) {
                    serpApiKey = savedSerpKey;
                }
            }

            hasTriggeredSearch = true;
            performSearch();
        } else if (!open && hasTriggeredSearch) {
            // Modal is closing - reset state
            hasTriggeredSearch = false;
            accumulatedImages = [];
            clearImageSearch();
        }
    });

    // Effect to save SerpAPI key to localStorage when it changes
    $effect(() => {
        if (typeof window !== "undefined" && serpApiKey) {
            localStorage.setItem("serpApiKey", serpApiKey);
        }
    });

    const performSearch = async (customFinding?: string) => {
        const searchQuery: ImageSearchQuery = {
            case_id: caseId,
            test_type: testType,
            test_name: testName,
            max_results: 30,
            search_depth: "advanced",
            test_finding:
                customFinding || editableFindingString || findingString,
            serp_key: serpApiKey,
        };

        try {
            await executeImageSearch(searchQuery);
        } catch (error) {
            console.error("Failed to search images:", error);
        }
    };

    const handleRetrySearch = async () => {
        if (!editableFindingString.trim()) return;
        await performSearch(editableFindingString);
    };
</script>

<!-- Use portal to render outside current DOM tree -->
{#if open}
    <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
    >
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="max-w-7xl max-h-[95vh] w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col m-2"
            role="dialog button"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabindex="-1"
            onkeydown={(e) => e.key === "Escape" && (open = false)}
        >
            <!-- Compact Header -->
            <div class="border-b {isHeaderCollapsed ? 'p-2' : 'p-4'}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Search class="w-4 h-4" />
                        <h2 id="modal-title" class="text-lg font-semibold">
                            Medical Images - {testName}
                        </h2>
                        <button
                            onclick={() =>
                                (isHeaderCollapsed = !isHeaderCollapsed)}
                            class="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                            {isHeaderCollapsed ? "Expand" : "Collapse"}
                        </button>
                    </div>
                    <button
                        onclick={() => (open = false)}
                        class="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Close"
                    >
                        <span class="sr-only">Close</span>
                        ✕
                    </button>
                </div>

                {#if !isHeaderCollapsed}
                    <!-- Compact Search Controls -->
                    <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-600"
                                for="serp-api-key">SerpAPI Key:</label
                            >
                            <input
                                id="serp-api-key"
                                bind:value={serpApiKey}
                                type="password"
                                placeholder="Enter SerpAPI key..."
                                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                disabled={searchState.isLoading}
                            />
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-xs font-medium text-gray-600"
                                for="search-query">Search Query:</label
                            >
                            <div class="flex gap-2">
                                <input
                                    id="search-query"
                                    bind:value={editableFindingString}
                                    placeholder="Enter or edit search query..."
                                    class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    disabled={searchState.isLoading}
                                />
                                <Button
                                    onclick={handleRetrySearch}
                                    disabled={searchState.isLoading ||
                                        !editableFindingString.trim()}
                                    variant="outline"
                                    size="sm"
                                    class="px-2 py-1 text-xs"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </div>

                    {#if searchState.results}
                        <div class="mt-2 flex gap-4 text-xs text-gray-600">
                            <span>
                                <strong>Found:</strong>
                                {searchState.results.total_images} images
                            </span>
                            <span>
                                <strong>Time:</strong>
                                {searchState.results.response_time}s
                            </span>
                        </div>
                    {/if}
                {:else}
                    <!-- Collapsed view - just show stats -->
                    {#if searchState.results}
                        <div class="mt-1 text-xs text-gray-600">
                            Found {searchState.results.total_images} images in {searchState
                                .results.response_time}s
                        </div>
                    {/if}
                {/if}
            </div>

            <!-- Content - Maximized for images -->
            <div class="flex-1 overflow-y-auto p-3">
                <!-- Loading State -->
                {#if searchState.isLoading}
                    <div
                        class="flex flex-col items-center justify-center py-12 space-y-4"
                    >
                        <div
                            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                        ></div>
                        <p class="text-sm text-gray-600">
                            Searching medical images...
                        </p>
                        <p class="text-xs text-gray-500">
                            This may take a few moments
                        </p>
                    </div>
                {/if}

                {#if searchState.error}
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p class="text-red-700 text-sm">
                            <strong>Error:</strong>
                            {searchState.error}
                        </p>
                    </div>
                {/if}

                {#if searchState.results}
                    <!-- Images Grid - Maximized -->
                    {#if searchState.results.images.length > 0}
                        <div class="space-y-2">
                            <div
                                class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                            >
                                {#each accumulatedImages as image, index}
                                    <a
                                        href={image.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="group cursor-pointer block"
                                    >
                                        <div
                                            class="relative aspect-square bg-gray-100 rounded overflow-hidden hover:shadow-lg transition-shadow"
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
                                                    class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        </div>
                                        <p
                                            class="mt-1 text-xs text-gray-600 line-clamp-2"
                                        >
                                            {image.description}
                                        </p>
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- No Results -->
                    {#if accumulatedImages.length === 0}
                        <div
                            class="flex flex-col items-center justify-center py-12 space-y-4"
                        >
                            <Search class="w-12 h-12 text-gray-400" />
                            <p class="text-gray-600">
                                No images found for this search.
                            </p>
                            <p class="text-sm text-gray-500">
                                Try adjusting your search criteria.
                            </p>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/if}

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
