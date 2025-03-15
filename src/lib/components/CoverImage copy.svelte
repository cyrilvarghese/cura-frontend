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

    const coverImageService = new CoverImageService();
    const coverImageData = writable<{
        image_url: string;
        prompt: string;
        title?: string | null;
        quote?: string | null;
    } | null>(null);
    const isLoading = writable(true);
    let currentPrompt: string = "";

    async function generateCoverImage() {
        isLoading.set(false);
        try {
            isLoading.set(true);
            // const response =
            //     await coverImageService.createCoverImage($lastCaseIdStore);
            // coverImageData.set(response);
            // curretPrompt = response.prompt;
            coverImageData.set({
                image_url: cover2,
                prompt: "Your role is to provide realistic, conversational, and contextually accurate responses based on the embedded case details. You are being asked questions by a doctor (marked as student_query) and should respond as a patient would in a medical interview. While answering, reflect your personality, emotions, and minor personal anecdotes where appropriate, without deviating from the embedded case details. Provide only the information explicitly requested in the student_query and avoid volunteering unrelated details. If asked a general or open-ended question, share just one noticeable or bothersome symptom or fact at a time, ensuring your responses feel natural and realistic.",
                title: "Test Title",
                quote: "Test Quote",
            });
            currentPrompt =
                "Your role is to provide realistic, conversational, and contextually accurate responses based on the embedded case details. You are being asked questions by a doctor (marked as student_query) and should respond as a patient would in a medical interview. While answering, reflect your personality, emotions, and minor personal anecdotes where appropriate, without deviating from the embedded case details. Provide only the information explicitly requested in the student_query and avoid volunteering unrelated details. If asked a general or open-ended question, share just one noticeable or bothersome symptom or fact at a time, ensuring your responses feel natural and realistic.";
        } catch (error) {
            console.error("Error generating cover image:", error);
        } finally {
            isLoading.set(false);
        }
    }

    async function generateWithPrompt() {
        debugger;
        if (!currentPrompt.trim()) return generateCoverImage();
        try {
            isLoading.set(true);
            // const response = await coverImageService.generateWithPrompt(
            //     $lastCaseIdStore,
            //     currentPrompt,
            // );
            // coverImageData.set(response);
            coverImageData.set({
                image_url: cover2,
                prompt: currentPrompt,
                title: "Test Title",
                quote: "Test Quote",
            });
        } catch (error) {
            console.error("Error generating cover image with prompt:", error);
        } finally {
            isLoading.set(false);
        }
    }

    onMount(() => {
        if (!$coverImageData) {
            generateCoverImage();
        }
    });
</script>

<div class="w-full bg-white">
    {#if $isLoading && !$coverImageData}
        <LoadingMessage message="Generating cover image" />
    {:else if $coverImageData}
        <div class="flex w-full flex-row items-start justify-start">
            <div class="flex gap-2 relative">
                <img
                    class="w-[400px] h-auto object-cover rounded-lg"
                    src={$coverImageData.image_url}
                    alt="Generated cover"
                />
                <Button
                    variant="outline"
                    onclick={generateCoverImage}
                    disabled={$isLoading}
                    class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                    <RefreshCw
                        class="h-4 w-4  {$isLoading ? 'animate-spin' : ''}"
                    />
                </Button>
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
                    "{$coverImageData.quote}"
                </blockquote>
                <Textarea
                    bind:value={currentPrompt}
                    class="h-[150px] overflow-y-auto w-full text-sm text-muted-foreground bg-transparent resize-none"
                />
                <Button
                    variant="outline"
                    onclick={generateWithPrompt}
                    disabled={$isLoading || !currentPrompt.trim()}
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
            <p>No cover image generated yet</p>
        </div>
    {/if}
</div>
