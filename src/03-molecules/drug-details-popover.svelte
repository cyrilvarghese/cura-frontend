<script lang="ts">
    import { X } from "lucide-svelte";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import { Loader2 } from "lucide-svelte";
    import type {
        DrugDetails,
        TreatmentFeedback,
    } from "$lib/services/treatmentProtocolService";
    import { treatmentProtocolStore } from "$lib/stores/treatmentProtocolStore";

    const { drugName } = $props<{
        drugName: string;
    }>();

    let loading = $state(false);
    let medication = $state<{
        drugName: string;
        dosage: string;
        feedback: TreatmentFeedback;
    } | null>(null);
    let isOpen = $state(false);
    let error = $state<string | null>(null);

    async function fetchDrugDetails() {
        if (!isOpen) return;

        loading = true;
        error = null;
        try {
            const result =
                await treatmentProtocolStore.evaluateTreatmentProtocol(
                    drugName,
                    "",
                    "",
                    false,
                );

            // Transform the result into the expected medication format
            medication = {
                drugName: drugName,
                dosage: "Standard dosing", // Default value
                feedback: result.feedback,
            };
        } catch (err) {
            console.error("Failed to fetch drug details:", err);
            error = "Failed to load drug information. Please try again.";
        } finally {
            loading = false;
        }
    }

    function handleOpenChange(open: boolean) {
        isOpen = open;
        if (open) {
            fetchDrugDetails();
        }
    }
</script>

<Popover.Root onOpenChange={handleOpenChange}>
    <Popover.Trigger asChild>
        <span class="cursor-pointer hover:underline text-blue-800 font-medium">
            {drugName}
        </span>
    </Popover.Trigger>
    <Popover.Content
        class="w-[48rem] p-0 shadow-lg border-0"
        side="right"
        align="start"
    >
        <div class="bg-white rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-4 border-b bg-blue-50">
                <div class="flex justify-between items-center">
                    <h3 class="font-medium text-lg italic">
                        {loading
                            ? "Loading drug information..."
                            : error
                              ? "Error loading drug information"
                              : medication?.feedback.details.teaching_tagline ||
                                drugName}
                    </h3>
                    <Popover.Close class="text-gray-500 hover:text-gray-700">
                        <X class="h-4 w-4" />
                    </Popover.Close>
                </div>
            </div>

            {#if loading}
                <div class="flex justify-center items-center h-64">
                    <Loader2 class="h-8 w-8 animate-spin text-blue-600" />
                </div>
            {:else if error}
                <div class="p-8 text-center">
                    <p class="text-red-600 mb-4">{error}</p>
                    <Button
                        variant="outline"
                        class="mx-auto"
                        on:click={fetchDrugDetails}
                    >
                        Try Again
                    </Button>
                </div>
            {:else if medication}
                <!-- Main content grid - always use grid with 2 columns -->
                <div class="grid grid-cols-2 gap-3 p-4">
                    <!-- Left column -->
                    <div class="space-y-3">
                        <!-- Primary info card -->
                        <div class="p-3 rounded-md bg-green-50">
                            <h4 class="font-medium text-sm mb-1">
                                {medication.feedback.details.why_in_this_case
                                    ? "Why in this case:"
                                    : "Used for:"}
                            </h4>
                            <p class="text-sm">
                                {medication.feedback.details.why_in_this_case ||
                                    "Information not available"}
                            </p>
                        </div>

                        <!-- Compare to correct -->
                        {#if medication.feedback.reason && !medication.feedback.match}
                            <div class="bg-yellow-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    Compare to correct:
                                </h4>
                                <p class="text-sm">
                                    {medication.feedback.reason}
                                </p>
                            </div>
                        {/if}

                        <!-- Indications -->
                        {#if medication.feedback.details.name || medication.feedback.details.class}
                            <div class="bg-green-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    Indication
                                </h4>
                                <div class="flex flex-wrap gap-1">
                                    {#each medication.feedback.details.indication?.split(",") || [] as ind}
                                        <span
                                            class="inline-flex capitalize items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100"
                                        >
                                            {ind.trim()}
                                        </span>
                                    {/each}

                                    {#if medication.feedback.details.class}
                                        <span
                                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {medication.feedback.details.class}
                                        </span>
                                    {/if}
                                </div>
                            </div>
                        {/if}

                        <!-- Mechanism -->
                        {#if medication.feedback.details.mechanism}
                            <div class="bg-gray-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    {medication.feedback.details.mechanism
                                        .label || "Mechanism of Action"}
                                </h4>
                                {#if medication.feedback.details.mechanism.what_it_means}
                                    <p class="text-sm mb-2">
                                        <span class="font-medium"
                                            >What it means:</span
                                        >
                                        {medication.feedback.details.mechanism
                                            .what_it_means}
                                    </p>
                                {/if}
                                {#if medication.feedback.details.mechanism.how_it_works}
                                    <p class="text-sm">
                                        {medication.feedback.details.mechanism
                                            .how_it_works}
                                    </p>
                                {/if}
                            </div>
                        {/if}

                        <!-- Dosing (shown for all medications) -->
                        {#if medication.feedback.details.standard_dose}
                            <div class="bg-gray-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">Dosing</h4>
                                <p class="text-sm font-medium flex items-start">
                                    <span class="mr-2 text-base">💊</span>
                                    {medication.feedback.details.standard_dose}
                                </p>
                                {#if medication.feedback.details.dose_adjustment}
                                    <p class="mt-2 text-sm flex items-start">
                                        <span class="mr-2 text-base">🔁</span>
                                        <span>
                                            <span class="font-medium"
                                                >Adjustment:</span
                                            >
                                            {medication.feedback.details
                                                .dose_adjustment}
                                        </span>
                                    </p>
                                {/if}
                                {#if medication.feedback.details.monitoring}
                                    <p class="mt-2 text-sm flex items-start">
                                        <span class="mr-2 text-base">🧪</span>
                                        <span>
                                            <span class="font-medium"
                                                >Monitoring:</span
                                            >
                                            {medication.feedback.details
                                                .monitoring}
                                        </span>
                                    </p>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <!-- Right column -->
                    <div class="space-y-3">
                        <!-- Memory tip (moved to right column) -->
                        {#if medication.feedback.details.mechanism?.memory_tip}
                            <div class="p-2 bg-yellow-50 rounded-md text-sm">
                                <span class="font-medium">Memory tip:</span>
                                {medication.feedback.details.mechanism
                                    .memory_tip}
                            </div>
                        {/if}

                        <!-- Alternative options -->
                        {#if medication.feedback.details.alternative_options && medication.feedback.details.alternative_options.length > 0}
                            <div class="bg-blue-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    Alternative Options
                                </h4>
                                <ul class="text-sm list-disc pl-5 space-y-1">
                                    {#each medication.feedback.details.alternative_options as option}
                                        <li>
                                            <span class="font-medium"
                                                >{option.alternative}</span
                                            >
                                            {#if option.condition}
                                                for {option.condition}
                                            {/if}
                                            {#if option.reason}
                                                <br /><span class="text-xs"
                                                    >{option.reason}</span
                                                >
                                            {/if}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}

                        <!-- Adverse Effects - check if property exists -->
                        {#if "adverse_effects" in medication.feedback.details && medication.feedback.details["adverse_effects"]}
                            <div class="bg-red-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    Adverse Effects
                                </h4>
                                <p class="text-sm flex items-start">
                                    <span class="mr-2 text-base">⚠️</span>
                                    {medication.feedback.details[
                                        "adverse_effects"
                                    ]}
                                </p>
                            </div>
                        {/if}

                        <!-- Contraindications - check if property exists -->
                        {#if "contraindications" in medication.feedback.details && medication.feedback.details["contraindications"]}
                            <div class="bg-red-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-1">
                                    Contraindications
                                </h4>
                                <p class="text-sm flex items-start">
                                    <span class="mr-2 text-base">🚫</span>
                                    {medication.feedback.details[
                                        "contraindications"
                                    ]}
                                </p>
                            </div>
                        {/if}

                        <!-- Other drugs in class -->
                        {#if medication.feedback.details.other_drugs_in_class && medication.feedback.details.other_drugs_in_class.length > 0}
                            <div class="bg-gray-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-2">
                                    Other drugs in class
                                </h4>
                                <div class="max-h-[180px] overflow-y-auto pr-1">
                                    <table
                                        class="w-full text-sm border-collapse"
                                    >
                                        <tbody>
                                            {#each medication.feedback.details.other_drugs_in_class as drug}
                                                <tr
                                                    class="border-b border-gray-200 last:border-0"
                                                >
                                                    <td
                                                        class="py-2 pr-4 font-medium w-1/3"
                                                        >{drug.name}</td
                                                    >
                                                    <td
                                                        class="py-2 text-gray-600"
                                                        >{drug.note || ""}</td
                                                    >
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="p-8 text-center">
                    <p class="text-gray-600">
                        No information available for this drug.
                    </p>
                </div>
            {/if}
        </div>
    </Popover.Content>
</Popover.Root>
