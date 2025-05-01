<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import {
        sendMessage,
        studentMessageHistory,
        updateMessage,
    } from "$lib/stores/apiStore";
    import { feedbackStore } from "$lib/stores/feedbackStore";
    import { finalDiagnosisStore } from "$lib/stores/finalDiagnosisStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { get } from "svelte/store";
    import { toast } from "svelte-sonner";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { X } from "lucide-svelte";
    import * as Popover from "$lib/components/ui/popover";

    export let open = false;
    export let onSubmit: () => void;

    let finalDiagnosis = "";
    let justification = "";
    let isSubmitting = false;
    let showFeedbackReport = false;

    async function handleSubmit() {
        onSubmit();
        isSubmitting = true;
        try {
            const caseId = get(currentCaseId);
            if (!caseId) {
                throw new Error("No case ID found");
            }

            // Record the final diagnosis using our new store
            await finalDiagnosisStore.recordFinalDiagnosis(
                caseId,
                finalDiagnosis,
                justification,
            );

            const messageContent = `Primary Diagnosis: ${finalDiagnosis}\nJustification: ${justification}\nDifferential Diagnoses: `;

            // Send message to chat
            await sendMessage(
                messageContent,
                "student",
                "final-diagnosis",
                "final-diagnosis",
            );

            // First send the feedback steps card and store its ID
            await sendMessage({}, "assistant", "feedback", "feedback-steps");

            open = false;
        } catch (error) {
            console.error("Error submitting diagnosis:", error);
            toast.error("Failed to submit final diagnosis", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            });
        } finally {
            isSubmitting = false;
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.ctrlKey && !isSubmitting) {
            event.preventDefault();
            handleSubmit();
        }
    }

    $: isValid = finalDiagnosis.trim() && justification.trim();
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" onkeydown={handleKeyDown}>
        <Dialog.Header>
            <Dialog.Title>Final Diagnosis</Dialog.Title>
            <Dialog.Description>
                Submit your final diagnosis and conclusions for this case. This
                will be your official diagnostic assessment.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <label for="diagnosis" class="text-sm font-medium"
                    >Final Diagnosis</label
                >
                <textarea
                    id="diagnosis"
                    bind:value={finalDiagnosis}
                    class="min-h-[100px] w-full rounded-md border p-2"
                    placeholder="Enter your final diagnosis..."
                ></textarea>
            </div>
            <div class="space-y-2">
                <label for="rationale" class="text-sm font-medium"
                    >Justification</label
                >
                <textarea
                    id="rationale"
                    bind:value={justification}
                    class="min-h-[100px] w-full rounded-md border p-2"
                    placeholder="Explain your diagnostic reasoning..."
                ></textarea>
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button
                >
            </Dialog.Close>
            <Button
                variant="default"
                onclick={handleSubmit}
                disabled={!isValid || isSubmitting}
            >
                {#if isSubmitting}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                {:else}
                    Submit Final Diagnosis
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- <HistoryFeedbackReport
    isOpen={showFeedbackReport}
    onClose={() => (showFeedbackReport = false)}
/> -->
