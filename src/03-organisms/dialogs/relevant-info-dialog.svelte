<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage, studentMessageHistory } from "$lib/stores/apiStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { evaluationStore } from "$lib/stores/evaluationStore";
    import { toast } from "svelte-sonner";
    import { get } from "svelte/store";
    import EvaluationFeedback from "../../02-molecules/evaluation-feedback.svelte";
    import type { EvaluationResponse } from "$lib/services/evaluationService";

    let { open = $bindable(), onSubmit } = $props<{
        open: boolean;
        onSubmit: () => void;
    }>();

    $effect(() => {
        if (!open) {
            evaluationResponse = null;
        }
    });

    // Store for relevant info points
    let relevantPoints = $state<string[]>([]);
    let newPoint = $state("");
    let isSubmitting = $state(false);
    let evaluationResponse = $state<EvaluationResponse | null>(null);
    let isEvaluating = $state(false);

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
        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            addPoint();
        }
    }

    async function handleSubmit() {
        isEvaluating = true;
        try {
            const messageContent = relevantPoints.join("\n");
            const caseId = get(currentCaseId);

            if (!caseId) {
                throw new Error("No case ID found");
            }

            const messages = get(studentMessageHistory);
            const response =
                await evaluationStore.evaluateFindings(relevantPoints);
            evaluationResponse = response;
        } catch (error) {
            toast.error("Failed to submit evaluation", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            });
        } finally {
            isEvaluating = false;
        }
    }

    async function handleContinue() {
        const messageContent = relevantPoints.join("\n");
        await sendMessage(
            messageContent,
            "student",
            "relevant-info",
            "relevant-info",
        );
        onSubmit();
        closeDialog();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (
            event.key === "Enter" &&
            event.ctrlKey &&
            relevantPoints.length > 0 &&
            !isSubmitting
        ) {
            event.preventDefault();
            handleSubmit();
        }
    }

    function closeDialog() {
        open = false;
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content
        class="sm:max-w-[800px]"
        onkeydown={handleKeyDown}
        onclose={closeDialog}
    >
        <Dialog.Header>
            <Dialog.Title>Positive Clinical Findings</Dialog.Title>
            <Dialog.Description>
                Add key points you've gathered from your conversation with the
                patient.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
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

            <div class="mt-4 flex justify-between gap-2">
                <Button
                    variant="link"
                    class="text-blue-600"
                    onclick={handleSubmit}
                    disabled={isEvaluating}
                >
                    {#if isEvaluating}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        checking...
                    {:else}
                        ? Check for missing findings
                    {/if}
                </Button>
                <div class="flex flex-row gap-2">
                    <Button variant="outline" onclick={closeDialog}
                        >Cancel</Button
                    >
                    <Button
                        disabled={isEvaluating || relevantPoints.length === 0}
                        onclick={handleContinue}
                    >
                        Continue
                    </Button>
                </div>
            </div>

            {#if evaluationResponse}
                {@debug evaluationResponse}
                <EvaluationFeedback
                    evaluation={evaluationResponse}
                    onContinue={handleContinue}
                />
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
