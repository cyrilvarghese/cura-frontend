<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage } from "$lib/stores/api-store";

    export let open = false;
    export let onSubmit: () => void;

    // Store for relevant info points
    let relevantPoints: string[] = [];
    let newPoint = "";
    let isSubmitting = false;

    // Function to add a new point
    function addPoint() {
        if (newPoint.trim()) {
            relevantPoints = [...relevantPoints, newPoint.trim()];
            newPoint = "";
        }
    }

    // Function to remove a point
    function removePoint(index: number) {
        relevantPoints = relevantPoints.filter((_, i) => i !== index);
    }

    // Handle key press for adding points
    function handlePointKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            addPoint();
        }
    }

    async function handleSubmit() {
        if (relevantPoints.length === 0) return;

        try {
            isSubmitting = true;
            const messageContent = `${relevantPoints.join('\n')}`;
            
            await sendMessage(
                messageContent,
                "student",
                "relevant-info",
                "relevant-info"
            );

            onSubmit();
            relevantPoints = [];
            open = false;
        } catch (error) {
            console.error("Error submitting relevant information:", error);
        } finally {
            isSubmitting = false;
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && event.ctrlKey && relevantPoints.length > 0 && !isSubmitting) {
            event.preventDefault();
            handleSubmit();
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content 
        class="sm:max-w-[800px]"
        onkeydown={handleKeyDown}
    >
        <Dialog.Header>
            <Dialog.Title>Positive Clinical Findings</Dialog.Title>
            <Dialog.Description>
                Add key points you've gathered from this case which are relevant to the case.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-4">
                <div class="flex gap-2">
                    <input
                        type="text"
                        class="flex-1 rounded-md border p-2"
                        placeholder="Add a key point..."
                        bind:value={newPoint}
                        onkeydown={handlePointKeyDown}
                    />
                    <Button variant="outline" size="sm" onclick={addPoint}>
                        <Plus class="h-4 w-4" />
                    </Button>
                </div>
                
                <div class="space-y-2">
                    {#each relevantPoints as point, index}
                        <div class="flex items-center gap-2">
                            <input 
                                type="text" 
                                class="flex-1 rounded-md border p-2 bg-gray-50" 
                                value={point} 
                                 
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => removePoint(index)}
                                class="text-gray-500 hover:text-gray-700"
                            >
                                <X class="h-4 w-4" />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </Dialog.Close>
            <Button 
                variant="default" 
                onclick={handleSubmit}
                disabled={relevantPoints.length === 0 || isSubmitting}
            >
                {#if isSubmitting}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                {:else}
                    Submit Information
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
