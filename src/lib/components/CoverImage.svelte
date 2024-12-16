<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { CoverImageService } from "$lib/services/coverImageService";
    import LoadingMessage from "./LoadingMessage.svelte";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import RefreshCw from "lucide-svelte/icons/refresh-cw";
import cover2 from '../../assets/cover2.webp'
import cover3 from '../../assets/cover3.webp'


    const coverImageService = new CoverImageService();
    const coverImageData = writable<{
        image_url: string;
        prompt: string;
    } | null>(null);
    const isLoading = writable(true);
    let currentPrompt: string = "";

    async function generateCoverImage() {
        isLoading.set(false);
        try {
            isLoading.set(true);
            const response =
                await coverImageService.createCoverImage($lastCaseIdStore);
            coverImageData.set(response);
            currentPrompt = response.prompt;
        } catch (error) {
            console.error("Error generating cover image:", error);
        } finally {
            isLoading.set(false);
        }
    }

    async function generateWithPrompt() {

        
        if (!currentPrompt.trim() || !$lastCaseIdStore) return generateCoverImage();
        try {
            isLoading.set(true);
            const response = await coverImageService.generateWithPrompt(
                $lastCaseIdStore,
                currentPrompt,
            );
            coverImageData.set(response);
        } catch (error) {
            console.error("Error generating cover image with prompt:", error);
        } finally {
            isLoading.set(false);
        }
    }

    onMount(() => {
        generateCoverImage();
    });
</script>

<div class="w-full bg-white rounded-lg shadow-sm">
    {#if $isLoading && !$coverImageData}
        <LoadingMessage message="Generating cover image" />
    {:else if $coverImageData}
        <div class="relative">
            <img
                class="w-[400px] h-auto object-cover rounded-lg"
                src={$coverImageData.image_url}
                alt="Generated cover"
                
            />

            <!-- Text Overlay (Green Box) -->
            <div 
                class="absolute top-0 left-[400px] w-[300px] bg-white/90 backdrop-blur-sm rounded-lg p-4 pt-0 shadow-sm"
            >
                <h3 class="text-lg text-muted-foreground font-medium mb-2">Image Description (pro   )</h3>
                <Textarea
                    bind:value={currentPrompt}
                    class="min-h-[300px] w-[500px] text-sm text-muted-foreground bg-transparent resize-none"
                />
            </div>

            <!-- Button Overlay (Red Box) -->
            <div class="absolute bottom-4 left-4 flex gap-2">
                <Button
                    variant="outline"
                    onclick={generateCoverImage}
                    disabled={$isLoading}
                    class="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                    <RefreshCw
                        class="h-4 w-4 mr-2 {$isLoading ? 'animate-spin' : ''}"
                    />
                    Random
                </Button>
                <Button
                    variant="outline"
                    onclick={generateWithPrompt}
                    disabled={$isLoading || !currentPrompt.trim()}
                    class="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                    <RefreshCw
                        class="h-4 w-4 mr-2 {$isLoading ? 'animate-spin' : ''}"
                    />
                    With Prompt
                </Button>
            </div>
        </div>
    {:else}
        <div class="text-center text-muted-foreground py-8">
            <p>No cover image generated yet</p>
        </div>
    {/if}
</div>
