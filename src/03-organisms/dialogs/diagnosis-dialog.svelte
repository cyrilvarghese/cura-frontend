<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import CheckCircle from "lucide-svelte/icons/check-circle";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import DiagnosisList from "$lib/components/DiagnosisList.svelte";
    import { sendMessage } from "$lib/stores/api";
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
            const differentialDiagnoses = diagnoses.filter(
                (d) => d.status === "differential",
            );

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
            // You might want to show an error toast here
        } finally {
            isSubmitting = false;
        }
    }

    $: isValid = diagnoses.some(
        (d) => d.status === "primary" && d.justification?.trim(),
    );
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Submit Initial Diagnosis</Dialog.Title>
            <Dialog.Description>
                <p class="font-semibold">
                    This is your initial diagnosis for Case #123, which you can
                    change later.
                </p>
                <p>
                    Please select your primary diagnosis and mark others as
                    differential or ruled out.
                </p>
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                    Use the dropdown to mark a diagnosis as primary,
                    differential, or ruled out.
                </p>
                <DiagnosisList bind:diagnoses />
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
