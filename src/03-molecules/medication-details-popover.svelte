<script lang="ts">
    import { X } from "lucide-svelte";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import type { TreatmentFeedback } from "$lib/services/treatmentProtocolService";

    const { medication, isMatch } = $props<{
        medication: {
            drugName: string;
            dosage: string;
            indication?: string;
            isPrimary?: boolean;
            feedback: TreatmentFeedback;
        };
        isMatch: boolean;
    }>();
</script>

<Popover.Root>
    <Popover.Trigger>
        <Button
            variant="link"
            class="text-sm p-0 h-0 text-blue-800 hover:underline"
        >
            Read more
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[36rem] p-0 shadow-lg border-0">
        <div class="bg-white rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-4 border-b bg-blue-50">
                <div class="flex justify-between items-center">
                    <h3 class="font-medium text-lg italic">
                        {medication.feedback.details.teaching_tagline}
                    </h3>
                    <Popover.Close class="text-gray-500 hover:text-gray-700">
                        <X class="h-4 w-4" />
                    </Popover.Close>
                </div>
            </div>

            <!-- Main content grid -->
            <div class={`${isMatch ? "grid grid-cols-2" : ""} gap-3 p-4`}>
                <!-- Left column (or single column when not a match) -->
                <div class="space-y-3">
                    <!-- Primary info card -->
                    <div
                        class={`p-3 rounded-md ${isMatch ? "bg-green-50" : "bg-gray-50"}`}
                    >
                        <h4 class="font-medium text-sm mb-1">
                            {isMatch ? "Why in this case:" : "Used for:"}
                        </h4>
                        <p class="text-sm">
                            {isMatch
                                ? medication.feedback.details.why_in_this_case
                                : medication.feedback.details.used_for ||
                                  medication.feedback.details.why_in_this_case}
                        </p>
                    </div>

                    <!-- Compare to correct (only for incorrect medications) -->
                    {#if !isMatch && medication.feedback.details.compare_to_correct}
                        <div class="bg-yellow-50 p-3 rounded-md">
                            <h4 class="font-medium text-sm mb-1">
                                Compare to correct:
                            </h4>
                            <p class="text-sm">
                                {medication.feedback.details.compare_to_correct}
                            </p>
                        </div>
                    {/if}

                    <!-- Mechanism -->
                    <div class="bg-gray-50 p-3 rounded-md">
                        <h4 class="font-medium text-sm mb-1">
                            {medication.feedback.details.mechanism.label}
                        </h4>
                        {#if medication.feedback.details.mechanism.what_it_means}
                            <p class="text-sm mb-2">
                                <span class="font-medium">What it means:</span>
                                {medication.feedback.details.mechanism
                                    .what_it_means}
                            </p>
                        {/if}
                        <p class="text-sm">
                            {medication.feedback.details.mechanism.how_it_works}
                        </p>
                        {#if medication.feedback.details.mechanism.memory_tip}
                            <div
                                class="mt-2 p-2 bg-yellow-50 rounded-md text-sm"
                            >
                                <span class="font-medium">Memory tip:</span>
                                {medication.feedback.details.mechanism
                                    .memory_tip}
                            </div>
                        {/if}
                    </div>

                    <!-- Other drugs in class (shown here if not a match) -->
                    {#if !isMatch && medication.feedback.details.other_drugs_in_class && medication.feedback.details.other_drugs_in_class.length > 0}
                        <div class="bg-gray-50 p-3 rounded-md">
                            <h4 class="font-medium text-sm mb-3">
                                Other drugs in class
                            </h4>
                            <table class="w-full text-sm border-collapse">
                                <tbody>
                                    {#each medication.feedback.details.other_drugs_in_class as drug}
                                        <tr
                                            class="border-b border-gray-200 last:border-0"
                                        >
                                            <td
                                                class="py-2.5 pr-4 font-medium w-1/3"
                                                >{drug.name}</td
                                            >
                                            <td class="py-2.5 text-gray-600"
                                                >{drug.note || ""}</td
                                            >
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>

                <!-- Right column (only shown for matching medications) -->
                {#if isMatch}
                    <div class="space-y-3">
                        <!-- Dosing -->
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
                                        {medication.feedback.details.monitoring}
                                    </span>
                                </p>
                            {/if}
                        </div>

                        <!-- Other drugs in class (shown in right column if is a match) -->
                        {#if medication.feedback.details.other_drugs_in_class && medication.feedback.details.other_drugs_in_class.length > 0}
                            <div class="bg-gray-50 p-3 rounded-md">
                                <h4 class="font-medium text-sm mb-3">
                                    Other drugs in class
                                </h4>
                                <table class="w-full text-sm border-collapse">
                                    <tbody>
                                        {#each medication.feedback.details.other_drugs_in_class as drug}
                                            <tr
                                                class="border-b border-gray-200 last:border-0"
                                            >
                                                <td
                                                    class="py-2.5 pr-4 font-medium w-1/3"
                                                    >{drug.name}</td
                                                >
                                                <td class="py-2.5 text-gray-600"
                                                    >{drug.note || ""}</td
                                                >
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </Popover.Content>
</Popover.Root>
