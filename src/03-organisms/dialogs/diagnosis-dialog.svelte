<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import CheckCircle from "lucide-svelte/icons/check-circle";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import DiagnosisList from "$lib/components/DiagnosisList.svelte";
    import { sendMessage } from "$lib/stores/apiStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { diagnosisStore } from "$lib/stores/diagnosisStore";
    import { toast } from "svelte-sonner";
    import { get } from "svelte/store";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

    export let open = false;
    export let onSubmit: (
        diagnoses: Array<{
            id: string;
            text: string;
            isPrimary: boolean;
            justification?: string;
            status: "primary" | "differential" | "ruled-out";
        }>,
    ) => void;

    let diagnoses: Array<{
        id: string;
        text: string;
        isPrimary: boolean;
        isIrrelevant?: boolean;
        justification?: string;
        status: "primary" | "differential" | "ruled-out";
    }> = [];

    let isSubmitting = false;

    async function handleSubmit(final: boolean = false) {
        const primaryDiagnosis = diagnoses.find((d) => d.status === "primary");

        if (!primaryDiagnosis || !primaryDiagnosis.justification) {
            return;
        }

        try {
            isSubmitting = true;
            const caseId = get(currentCaseId);

            if (!caseId) {
                throw new Error("No case ID found");
            }

            // Record the diagnosis using our new store
            await diagnosisStore.recordDiagnosis(caseId, diagnoses);

            const differentialDiagnoses = diagnoses.filter(
                (d) => d.status === "differential",
            );

            debugger;
            const messageContent = `Primary Diagnosis: ${primaryDiagnosis.text}\nJustification: ${primaryDiagnosis.justification}\nDifferential Diagnoses: ${differentialDiagnoses.map((d) => d.text).join(", ")}`;

            await sendMessage(
                messageContent,
                "student",
                "diagnosis",
                "diagnosis",
            );

            onSubmit(diagnoses);
            open = false;
        } catch (error) {
            console.error("Error submitting diagnosis:", error);
            toast.error("Failed to submit diagnosis", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            });
        } finally {
            isSubmitting = false;
        }
    }

    $: isValid = diagnoses.some(
        (d) => d.status === "primary" && d.justification?.trim(),
    );

    function handleKeyDown(event: KeyboardEvent) {
        if (
            event.key === "Enter" &&
            event.ctrlKey &&
            isValid &&
            !isSubmitting
        ) {
            event.preventDefault();
            handleSubmit(false);
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px] " onkeydown={handleKeyDown}>
        <Dialog.Header>
            <Dialog.Title>Submit Initial Diagnosis</Dialog.Title>
            <Dialog.Description>
                <p>
                    Use the dropdown to mark a diagnosis as primary,
                    differential, or ruled out.
                </p>
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-2">
            <div class="relative">
                <div
                    class="max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                    <DiagnosisList bind:diagnoses />
                </div>
                <div
                    class="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-700/20 to-transparent"
                ></div>
            </div>
        </div>

        <Dialog.Footer>
            <div class="flex justify-between w-full">
                <Dialog.Close>
                    <Button variant="outline" disabled={isSubmitting}
                        >Cancel</Button
                    >
                </Dialog.Close>
                <Button
                    variant="default"
                    onclick={() => handleSubmit()}
                    disabled={!isValid || isSubmitting}
                >
                    {#if isSubmitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    {:else}
                        Submit Diagnosis
                        <CheckCircle class="ml-2 h-4 w-4" />
                    {/if}
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
