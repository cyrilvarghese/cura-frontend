<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { searchMedicalImages } from "$lib/stores/caseCreatorStore";
    import type { ImageSearchResponse } from "$lib/services/imageSearchService";

    const {
        open = $bindable(false),
        onSelectImage,
        caseId,
    } = $props<{
        open?: boolean;
        onSelectImage: (imageUrl: string) => void;
        caseId: string;
    }>();

    let searchDialogOpen = $state(open);
    let searchQuery = $state("");
    let searchResults = $state<ImageSearchResponse | null>(null);
    let isSearching = $state(false);
    let searchError = $state<string | null>(null);

    $effect(() => {
        searchDialogOpen = open;
    });

    async function handleSearch() {
        if (!searchQuery.trim()) return;

        try {
            isSearching = true;
            searchError = null;
            const results = await searchMedicalImages(searchQuery);
            searchResults = results ?? null;
        } catch (error) {
            searchError =
                error instanceof Error ? error.message : "Search failed";
        } finally {
            isSearching = false;
        }
    }

    function selectImage(imageUrl: string) {
        onSelectImage(imageUrl);
    }
</script>

<Dialog.Root bind:open={searchDialogOpen}>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Search Medical Images</Dialog.Title>
            <Dialog.Description>
                Search for relevant medical images to add to your case.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter search terms..."
                    class="flex-1 px-3 py-2 border rounded-md"
                    bind:value={searchQuery}
                    onkeydown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                    variant="default"
                    onclick={handleSearch}
                    disabled={isSearching}
                >
                    {#if isSearching}
                        <span class="animate-spin mr-2">⌛</span>
                    {/if}
                    Search
                </Button>
            </div>

            {#if searchError}
                <p class="text-sm text-destructive">{searchError}</p>
            {/if}

            {#if searchResults}
                <div
                    class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto"
                >
                    {#each searchResults.images as image}
                        <div class="border rounded-md p-2 space-y-2">
                            <img
                                src={image.url}
                                alt={image.title}
                                class="w-full h-48 object-cover rounded-md"
                            />
                            <p class="text-sm font-medium truncate">
                                {image.title}
                            </p>
                            <p class="text-xs text-muted-foreground truncate">
                                Source: {image.source}
                            </p>
                            <Button
                                variant="outline"
                                class="w-full"
                                onclick={() => selectImage(image.url)}
                            >
                                Select Image
                            </Button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline">Cancel</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
