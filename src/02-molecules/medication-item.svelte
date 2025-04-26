<script lang="ts">
    import { X } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import MedicationDetailsPopover from "../03-molecules/medication-details-popover.svelte";
    import type {
        DrugDetails,
        TreatmentFeedback,
    } from "$lib/services/treatmentProtocolService";

    const { medication, onRemove } = $props<{
        medication: {
            drugName: string;
            dosage: string;
            indication?: string;
            isPrimary?: boolean;
            feedback: TreatmentFeedback;
        };
        onRemove: () => void;
    }>();

    const bgColor = $derived(
        medication.feedback.match === "NA"
            ? "bg-yellow-50"
            : Boolean(medication.feedback.match) &&
                medication.feedback.match !== "NA"
              ? "bg-gray-50"
              : "bg-red-50",
    );

    const isMatch = $derived(
        Boolean(medication.feedback.match) &&
            medication.feedback.match !== "NA",
    );

    const isInvalidEntry = $derived(medication.feedback.match === "NA");
</script>

<div class="flex items-center justify-between {bgColor} p-3 rounded-md">
    <!-- Base medication info -->
    <div class="flex flex-col items-start gap-2 justify-between">
        <div class="flex items-center gap-2">
            <span class="font-medium">{medication.drugName}</span>
            <span class="text-gray-500">({medication.dosage})</span>
            {#if medication.indication}
                <span class="text-gray-600">- {medication.indication}</span>
            {/if}
            {#if !isInvalidEntry}
                <span
                    class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                >
                    {medication.feedback.details.class}
                </span>
                {#if medication.feedback.classification_correct}
                    <span
                        class="text-green-600 cursor-help"
                        title="Well done - you identified the first line of treatment!"
                    >
                        ⭐
                    </span>
                {/if}
            {/if}
        </div>

        <!-- Feedback section -->
        <div class="flex items-center gap-4">
            {#if isInvalidEntry}
                <div class="flex items-start justify-start gap-2">
                    <span class="text-yellow-600">⚠️</span>
                    <span class="text-sm text-gray-600 w-[600px]">
                        {medication.feedback.reason}
                    </span>
                </div>
            {:else if isMatch}
                <div class="flex items-start justify-start flex-row gap-2">
                    <span class="text-green-600">✅</span>
                    <span class="text-sm text-gray-600 w-[600px]">
                        {medication.feedback.reason}
                        <MedicationDetailsPopover {medication} {isMatch} />
                    </span>
                </div>
            {:else}
                <div class="flex items-start justify-start gap-2">
                    <span class="text-sm">❌</span>
                    <span class="text-sm text-gray-600 w-[600px]">
                        {medication.feedback.reason}
                        <MedicationDetailsPopover {medication} {isMatch} />
                    </span>
                </div>
            {/if}
        </div>
    </div>
    <Button
        variant="ghost"
        size="icon"
        onclick={onRemove}
        class="text-gray-500 hover:text-gray-700"
    >
        <X class="h-4 w-4" />
    </Button>
</div>
