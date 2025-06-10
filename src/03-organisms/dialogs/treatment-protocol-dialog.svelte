<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X, CheckCircle2, Flag, Ban } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage } from "$lib/stores/apiStore";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { treatmentProtocolStore } from "$lib/stores/treatmentProtocolStore";
    import { treatmentFeedbackStore } from "$lib/stores/treatmentFeedbackStore";
    import MedicationItem from "../../02-molecules/medication-item.svelte";
    import type { TreatmentFeedback } from "$lib/services/treatmentProtocolService";
    import mixpanel from "mixpanel-browser";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { currentDepartment } from "$lib/stores/teamStore";

    let { open = $bindable(), onSubmit } = $props<{
        open: boolean;
        onSubmit: () => void;
    }>();

    type MedicationProtocol = {
        drugName: string;
        dosage: string;
        indication: string;
        isPrimary: boolean;
        feedback: TreatmentFeedback;
    };

    let { medications } = $state({ medications: [] as MedicationProtocol[] });
    let {
        newDrug,
        newDosage,
        newIndication,
        newMedicationIsPrimary,
        isSubmitting,
        feedback,
    } = $state({
        newDrug: "",
        newDosage: "",
        newIndication: "",
        newMedicationIsPrimary: false,
        isSubmitting: false,
        feedback: null as TreatmentFeedback | null,
    });

    let dosageInput: HTMLInputElement;
    let indicationInput: HTMLInputElement;
    let drugNameInput: HTMLInputElement;
    let isAddingMedication = $state(false);

    let { showSuccess, successMessage } = $state({
        showSuccess: false,
        successMessage: "",
    });

    async function addMedication() {
        if (newDrug.trim() && newDosage.trim()) {
            try {
                isAddingMedication = true;
                const response =
                    await treatmentProtocolStore.evaluateTreatmentProtocol(
                        newDrug.trim(),
                        newDosage.trim(),
                        newIndication.trim(),
                        newMedicationIsPrimary,
                    );

                showSuccess = true;
                successMessage = "First line of treatment";

                medications = [
                    ...medications,
                    {
                        drugName: newDrug.trim(),
                        dosage: newDosage.trim(),
                        indication: newIndication.trim(),
                        isPrimary: newMedicationIsPrimary,
                        feedback: response.feedback,
                    },
                ];

                newDrug = "";
                newDosage = "";
                newIndication = "";
                newMedicationIsPrimary = false;
                drugNameInput.focus();
            } catch (error) {
                feedback = null;
                showSuccess = false;
                successMessage = "";
                console.error("Error:", error);
            } finally {
                isAddingMedication = false;
            }
        }
    }

    function removeMedication(index: number) {
        medications = medications.filter((_, i) => i !== index);
    }

    async function togglePrimary(index: number) {
        const med = medications[index];
        try {
            const feedback =
                await treatmentProtocolStore.evaluateTreatmentProtocol(
                    med.drugName,
                    med.dosage,
                    med.indication,
                    !med.isPrimary, // toggled state
                );
            console.log(
                "Treatment Protocol Feedback (Primary Toggle):",
                feedback,
            );

            medications = medications.map((m, i) =>
                i === index ? { ...m, isPrimary: !m.isPrimary } : m,
            );
        } catch (error) {
            console.error("Error getting treatment protocol feedback:", error);
        }
    }

    async function handleSubmit() {
        if (medications.length === 0) return;

        try {
            isSubmitting = true;

            // Format medications into treatment plan strings
            const treatmentPlan = medications.map(
                (med) =>
                    `Drugs - ${med.drugName} ${med.dosage}${med.indication ? `| Notes -  ${med.indication}` : ""}`,
            );

            // Call the API
            const response =
                await treatmentProtocolStore.recordTreatmentPlan(treatmentPlan);

            // Send the treatment protocol message
            await sendMessage(
                JSON.stringify(
                    {
                        treatmentProtocol: medications,
                        treatmentPlan: treatmentPlan,
                    },
                    null,
                    2,
                ),
                "student",
                "treatment-protocol",
                "treatment-protocol",
            );

            // Get treatment protocol feedback from our new store
            const feedbackResponse =
                await treatmentFeedbackStore.getTreatmentFeedback(
                    treatmentPlan,
                );
            mixpanel.track("Treatment Protocol Feedback", {
                case_id: $currentCaseId,
                department: $currentDepartment?.name,
            });

            // Send the feedback message to display our new component
            debugger;
            await sendMessage(
                feedbackResponse,
                "assistant",
                "treatment-feedback",
                "feedback-protocol",
            );

            onSubmit();
            medications = [];
            open = false;
        } catch (error) {
            console.error("Error submitting treatment protocol:", error);
        } finally {
            isSubmitting = false;
        }
    }

    function handleInputKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (e.ctrlKey) {
                if (!isSubmitting && medications.length > 0) {
                    handleSubmit();
                }
            } else {
                if (e.target === drugNameInput) dosageInput.focus();
                else if (e.target === dosageInput) indicationInput.focus();
                else if (
                    e.target === indicationInput &&
                    newDrug.trim() &&
                    newDosage.trim()
                ) {
                    addMedication();
                }
            }
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px]" onkeydown={handleInputKeyDown}>
        <Dialog.Header>
            <Dialog.Title>Treatment Protocol</Dialog.Title>
            <Dialog.Description>
                Add medications with their dosages and any special notes.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-6 py-4">
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="space-y-2">
                        <label
                            for="drugName"
                            class="text-sm font-medium text-gray-700"
                            >Drug Name</label
                        >
                        <div class="space-y-1.5">
                            <input
                                type="text"
                                class="w-full rounded-md border p-2"
                                placeholder="e.g., Hydroxyzine, Loratadine"
                                bind:value={newDrug}
                                bind:this={drugNameInput}
                                onkeydown={handleInputKeyDown}
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label
                            for="dosage"
                            class="text-sm font-medium text-gray-700"
                            >Dosage</label
                        >
                        <input
                            type="text"
                            class="w-full rounded-md border p-2"
                            placeholder="e.g., 10 mg/once daily"
                            bind:value={newDosage}
                            bind:this={dosageInput}
                            onkeydown={handleInputKeyDown}
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            for="indication"
                            class="text-sm font-medium text-gray-700"
                            >Additional Notes</label
                        >
                        <div class="flex gap-2">
                            <input
                                type="text"
                                class="flex-1 rounded-md border p-2"
                                placeholder="e.g., for night time Pruritus"
                                bind:value={newIndication}
                                bind:this={indicationInput}
                                onkeydown={handleInputKeyDown}
                            />
                            <div
                                title={!newDrug.trim()
                                    ? "Please enter a drug name"
                                    : !newDosage.trim()
                                      ? "Please enter a dosage"
                                      : !newIndication.trim()
                                        ? "Please enter an indication"
                                        : "Add medication"}
                            >
                                <Button
                                    variant="default"
                                    size="sm"
                                    onclick={addMedication}
                                    disabled={!newDrug.trim() ||
                                        !newDosage.trim() ||
                                        !newIndication.trim() ||
                                        isAddingMedication}
                                >
                                    {#if isAddingMedication}
                                        <Loader2 class="h-4 w-4 animate-spin" />
                                    {:else}
                                        <Plus class="h-4 w-4" />
                                    {/if}
                                </Button>
                            </div>
                        </div>
                        <!-- <div class="flex items-center gap-2">
                            <Checkbox
                                id="firstLine"
                                bind:checked={newMedicationIsPrimary}
                            />
                            <label
                                for="firstLine"
                                class="text-sm text-gray-600"
                            >
                                First line of treatment
                            </label>
                        </div> -->
                    </div>
                </div>

                {#if medications.length > 0}
                    <div class="pt-4">
                        <h3 class="text-sm font-medium text-gray-700 mb-2">
                            Added Medications
                        </h3>
                    </div>
                {/if}

                <div class="space-y-2">
                    {#each medications as med, index}
                        <MedicationItem
                            medication={med}
                            onRemove={() => removeMedication(index)}
                        />
                    {/each}
                </div>
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button
                >
            </Dialog.Close>
            <div
                class="flex items-center gap-2"
                title={medications.length === 0
                    ? "Please add at least one medication"
                    : "Submit treatment protocol"}
            >
                <Button
                    variant="default"
                    onclick={handleSubmit}
                    disabled={medications.length === 0 || isSubmitting}
                >
                    {#if isSubmitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    {:else}
                        Submit Protocol
                    {/if}
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
