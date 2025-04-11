<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { sendMessage, studentMessageHistory } from "$lib/stores/apiStore";
    import { feedbackStore } from "$lib/stores/feedbackStore";
    import Loader2 from "lucide-svelte/icons/loader-2";

    export let open = false;
    export let onSubmit: () => void;

    let finalDiagnosis = "";
    let justification = "";
    let isSubmitting = false;

    async function handleSubmit() {
        onSubmit();
        isSubmitting = true;
        try {
            const messageContent = `Primary Diagnosis: ${finalDiagnosis}\nJustification: ${justification}\nDifferential Diagnoses: `;

            // Send message to chat
            await sendMessage(
                messageContent,
                "student",
                "final-diagnosis",
                "final-diagnosis",
            );

            // Get feedback
            const feedbackResponse = await feedbackStore.getFeedback(
                $studentMessageHistory,
            );

            // Send feedback directly
            await sendMessage(
                feedbackResponse, // Send the feedback response object directly
                "assistant",
                "feedback",
                "feedback",
            );

            // Close dialog
            open = false;
        } catch (error) {
            console.error("Error submitting diagnosis:", error);
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
