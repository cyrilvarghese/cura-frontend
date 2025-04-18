<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { CoverImageService } from "$lib/services/coverImageService";
    import LoadingMessage from "./LoadingMessage.svelte";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import RefreshCw from "lucide-svelte/icons/refresh-cw";
    import cover2 from "../../assets/cover2.webp";
    import cover3 from "../../assets/cover3.webp";
    import { API_BASE_URL } from "$lib/config/api";

    const coverImageService = new CoverImageService();
    let coverImageData = $state<{
        image_url: string;
        prompt: string;
        title?: string | null;
        quote?: string | null;
    } | null>(null);
    const isLoading = writable(true);
    const isError = writable(false);
    let currentPrompt = $state("");
    let { caseId, imageUrl, prompt, title, quote } = $props();
    async function generateCoverImage() {
        isLoading.set(false);
        try {
            if (imageUrl && prompt && title && quote) {
                coverImageData = {
                    image_url: API_BASE_URL + imageUrl,
                    prompt: prompt,
                    title: title,
                    quote: quote,
                };
                currentPrompt = prompt;
            } else {
                isLoading.set(true);
                const response =
                    await coverImageService.createCoverImage(caseId);
                coverImageData = {
                    image_url: API_BASE_URL + response.image_url,
                    prompt: response.prompt,
                    title: response.title,
                    quote: response.quote,
                };
                currentPrompt = response.prompt;
            }
        } catch (error) {
            console.error("Error generating cover image:", error);
            isError.set(true);
        } finally {
            isLoading.set(false);
        }
    }

    async function generateWithPrompt() {
        if (!currentPrompt.trim() || !coverImageData)
            return generateCoverImage();
        try {
            isLoading.set(true);
            const response = await coverImageService.generateWithPrompt(
                caseId,
                currentPrompt,
                coverImageData.title ?? "",
                coverImageData.quote ?? "",
            );
            coverImageData = {
                image_url: API_BASE_URL + response.image_url,
                prompt: response.prompt,
                title: response.title,
                quote: response.quote,
            };
            // coverImageData.set({
            //     image_url: cover2,
            //     prompt: currentPrompt,
            //     title: "Test Title",
            //     quote: "Test Quote",
            // });
        } catch (error) {
            console.error("Error generating cover image with prompt:", error);
            isError.set(true);
        } finally {
            isLoading.set(false);
        }
    }

    $effect(() => {
        if (caseId) {
            isLoading.set(false);
            generateCoverImage();
        }
    });
</script>

<div class="w-full bg-white">
    {#if $isLoading && !coverImageData}
        <LoadingMessage message="Generating cover image" />
    {:else if coverImageData}
        <div class="flex w-full flex-row items-start justify-start">
            <div class="flex gap-2 relative">
                <img
                    class="w-[400px] h-auto object-cover rounded-lg"
                    src={coverImageData.image_url}
                    alt="Generated cover"
                />
            </div>

            <!-- Text Overlay (Green Box) -->
            <div class="w-full bg-white/90 backdrop-blur-sm p-4 pt-0">
                <h3 class="text-lg text-muted-foreground font-medium mb-2">
                    Image Description (prompt)
                </h3>

                <!-- <h4 class="text-sm text-muted-foreground font-medium mb-2">
                    {$coverImageData.title}
                </h4> -->
                <blockquote
                    class="text-sm text-muted-foreground font-medium mb-2"
                >
                    "{coverImageData.quote}"
                </blockquote>
                <Textarea
                    bind:value={coverImageData.prompt}
                    class="h-[150px] overflow-y-auto w-full text-sm text-muted-foreground bg-transparent resize-none"
                />
                <Button
                    variant="outline"
                    onclick={generateWithPrompt}
                    disabled={$isLoading || !coverImageData.prompt.trim()}
                    class="bg-white/90 mt-4 backdrop-blur-sm hover:bg-white"
                >
                    <RefreshCw
                        class="h-4 w-4 mr-2 {$isLoading ? 'animate-spin' : ''}"
                    />
                    With Prompt
                </Button>
            </div>

            <!-- Button Overlay (Red Box) -->
        </div>
    {:else}
        <div class="text-center text-muted-foreground py-8">
            {#if $isError}
                <p>Error generating cover image</p>
                <Button
                    class="bg-red-500 text-white mt-4"
                    onclick={generateCoverImage}>Retry</Button
                >
            {:else}
                <p>No cover image generated yet</p>
            {/if}
        </div>
    {/if}
</div>
