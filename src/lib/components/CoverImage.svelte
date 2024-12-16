<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { CoverImageService } from "$lib/services/coverImageService";
    import LoadingMessage from "./LoadingMessage.svelte";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { Button } from "$lib/components/ui/button";
    import RefreshCw from "lucide-svelte/icons/refresh-cw"; // Import refresh icon

    const coverImageService = new CoverImageService();
    const coverImageData = writable<{
        image_url: string;
        prompt: string;
    } | null>(null);
    const isLoading = writable(true);

    async function generateCoverImage() {
        try {
            isLoading.set(true);
            const response =
                await coverImageService.createCoverImage($lastCaseIdStore);
            coverImageData.set(response);
        } catch (error) {
            console.error("Error generating cover image:", error);
        } finally {
            isLoading.set(false);
        }
    }

    onMount(() => {
        generateCoverImage();
    });
</script>

<div class="w-full bg-white rounded-lg p-4 mb-4">
    {#if $isLoading}
        <LoadingMessage message="Generating cover image" />
    {:else if $coverImageData}
        <div class="flex flex-row gap-4 w-full">
            <img
                class="w-[400px] h-auto rounded-lg"
                src={$coverImageData.image_url}
                alt={$coverImageData.prompt || "Cover Image"}
            />
            <p class=" w-[300px] text-sm text-muted-foreground ">
                {$coverImageData.prompt}
            </p>
        </div>
        <Button
            variant="outline"
            onclick={() => generateCoverImage()}
            class="w-fit"
        >
            <RefreshCw class="mr-2 h-4 w-4" />
            Generate Again
        </Button>
    {:else}
        <div class="text-center text-muted-foreground py-8">
            <p>No cover image card generated yet</p>
        </div>
    {/if}
</div>
