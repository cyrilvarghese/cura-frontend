<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage } from "$lib/stores/apiStore";

    export let open = false;
    export let onSubmit: () => void;

    type MedicationProtocol = {
        drugName: string;
        dosage: string;
        notes: string;
    };

    let medications: MedicationProtocol[] = [];
    let newDrug = "";
    let newDosage = "";
    let newNotes = "";
    let isSubmitting = false;

    function addMedication() {
        if (newDrug.trim() && newDosage.trim()) {
            medications = [
                ...medications,
                {
                    drugName: newDrug.trim(),
                    dosage: newDosage.trim(),
                    notes: newNotes.trim(),
                },
            ];
            // Clear inputs after adding
            newDrug = "";
            newDosage = "";
            newNotes = "";
        }
    }

    function removeMedication(index: number) {
        medications = medications.filter((_, i) => i !== index);
    }

    async function handleSubmit() {
        if (medications.length === 0) return;

        try {
            isSubmitting = true;
            const treatmentData = {
                treatmentProtocol: medications,
            };

            await sendMessage(
                JSON.stringify(treatmentData, null, 2),
                "student",
                "treatment-protocol",
                "treatment-protocol",
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
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Treatment Protocol</Dialog.Title>
            <Dialog.Description>
                Add medications with their dosages and any special notes.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-6 py-4">
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="grid gap-2">
                        <label class="text-sm font-medium text-gray-700"
                            >Drug Name</label
                        >
                        <input
                            type="text"
                            class="rounded-md border p-2"
                            placeholder="e.g., Hydroxyzine, Loratadine"
                            bind:value={newDrug}
                        />
                    </div>
                    <div class="grid gap-2">
                        <label class="text-sm font-medium text-gray-700"
                            >Dosage</label
                        >
                        <input
                            type="text"
                            class="rounded-md border p-2"
                            placeholder="e.g., 25-50 mg, 10 mg"
                            bind:value={newDosage}
                        />
                    </div>
                    <div class="grid gap-2">
                        <label class="text-sm font-medium text-gray-700"
                            >Additional Notes</label
                        >
                        <div class="flex gap-2">
                            <input
                                type="text"
                                class="flex-1 rounded-md border p-2"
                                placeholder="e.g., Take at bedtime, Take with food"
                                bind:value={newNotes}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onclick={addMedication}
                                disabled={!newDrug.trim() || !newDosage.trim()}
                            >
                                <Plus class="h-4 w-4" />
                            </Button>
                        </div>
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
                        <div
                            class="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                        >
                            <div class="flex-1 flex gap-2">
                                <span class="font-medium">{med.drugName}</span>
                                <span class="text-gray-500">-</span>
                                <span>{med.dosage}</span>
                                {#if med.notes}
                                    <span class="text-gray-500">-</span>
                                    <span class="text-gray-600"
                                        >{med.notes}</span
                                    >
                                {/if}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => removeMedication(index)}
                                class="text-gray-500 hover:text-gray-700 ml-2"
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
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button
                >
            </Dialog.Close>
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
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
