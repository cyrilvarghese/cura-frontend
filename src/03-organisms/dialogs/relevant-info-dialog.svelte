<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeft, Plus, X, CheckCircle, XCircle } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage, studentMessageHistory } from "$lib/stores/apiStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { evaluationStore } from "$lib/stores/evaluationStore";
    import { toast } from "svelte-sonner";
    import { get } from "svelte/store";
    import EvaluationFeedback from "../../02-molecules/evaluation-feedback.svelte";
    import type { EvaluationResponse } from "$lib/services/evaluationService";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

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

    // Add this to track evaluation results for each point
    let pointEvaluations = $state<Record<string, boolean>>({});
    let evaluationInProgress = $state<Record<string, boolean>>({});

    // Add this to store messages
    let evaluationMessages = $state<Record<string, string>>({});

    // Function to add a new point
    async function addPoint() {
        if (newPoint.trim()) {
            const point = newPoint.trim();

            // Add the point immediately
            relevantPoints = [...relevantPoints, point];

            // Mark this point as being evaluated
            evaluationInProgress = { ...evaluationInProgress, [point]: true };

            // Clear the input
            newPoint = "";

            try {
                // Call the API to evaluate the point
                const result =
                    await evaluationStore.evaluateSingleFinding(point);

                // Store the evaluation result and message
                pointEvaluations = {
                    ...pointEvaluations,
                    [point]: result.evaluation.match,
                };
                evaluationMessages = {
                    ...evaluationMessages,
                    [point]: result.evaluation.message,
                };
            } catch (error) {
                console.error("Error evaluating point:", error);
            } finally {
                // Mark evaluation as complete
                evaluationInProgress = {
                    ...evaluationInProgress,
                    [point]: false,
                };
                if (evaluationResponse) {
                    handleSubmit(); // refresh the evaluation
                }
            }
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
                                <div
                                    class="flex-1 flex-start rounded-md border p-3 bg-gray-50"
                                >
                                    <div class="flex items-center gap-3">
                                        <p class="text-base">{point}</p>

                                        {#if evaluationInProgress[point]}
                                            <div
                                                class="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                                            ></div>
                                        {:else if point in pointEvaluations}
                                            {#if pointEvaluations[point]}
                                                <CheckCircle
                                                    class="h-5 w-5 text-green-500 flex-shrink-0"
                                                />
                                            {:else}
                                                <XCircle
                                                    class="h-5 w-5 text-red-500 flex-shrink-0"
                                                />
                                            {/if}
                                            <p
                                                class="text-sm italic text-gray-600"
                                            >
                                                {evaluationMessages[point] ||
                                                    (pointEvaluations[point]
                                                        ? "Correct finding"
                                                        : "Incorrect finding")}
                                            </p>
                                        {/if}
                                    </div>
                                </div>

                                <!-- <Button
                                    variant="ghost"
                                    size="icon"
                                    onclick={() => removePoint(index)}
                                    class="text-gray-500 hover:text-gray-700"
                                >
                                    <X class="h-4 w-4" />
                                </Button> -->
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="mt-4 flex justify-between gap-2">
                <div class="flex flex-row gap-2"></div>
                <div class="flex flex-row gap-2">
                    <Button variant="outline" onclick={closeDialog}>
                        <ArrowLeft class="h-4 w-4" />
                        Back to conversation
                    </Button>
                    <Button onclick={handleSubmit} disabled={isEvaluating}>
                        {#if evaluationResponse}
                            <Button
                                disabled={isEvaluating ||
                                    relevantPoints.length === 0}
                                onclick={handleContinue}
                            >
                                Submit Current Findings
                            </Button>
                        {:else if isEvaluating}
                            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        {:else}
                            Submit
                        {/if}
                    </Button>
                </div>
            </div>

            {#if evaluationResponse}
                <EvaluationFeedback
                    evaluation={evaluationResponse}
                    onContinue={handleContinue}
                />
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
