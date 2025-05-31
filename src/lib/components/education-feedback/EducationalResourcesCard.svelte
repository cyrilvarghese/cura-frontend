<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        BookOpen,
        ToggleLeft,
        ToggleRight,
        FileText,
        Info,
        ListTree,
        Stethoscope,
        AlertTriangle,
        FlaskConical,
        Loader2,
        AlertCircle,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { onMount } from "svelte";
    import { educationalResourcesFeedbackStore } from "$lib/stores/educationalResourcesFeedbackStore";
    import DiseaseFocusedView from "./DiseaseFocusedView.svelte";
    import ComparativeView from "./ComparativeView.svelte";
    import { Switch } from "$lib/components/ui/switch";

    // Optional props
    const { caseId = undefined } = $props();

    // Add state for view toggle
    let isComparativeView = $state(false);

    // Data comes from the dedicated store using runes
    const educationalCapsules = $derived(
        $educationalResourcesFeedbackStore.educationalResourcesFeedback
            ?.educationalCapsules,
    );
    const isLoading = $derived($educationalResourcesFeedbackStore.isLoading);
    const error = $derived($educationalResourcesFeedbackStore.error);

    onMount(async () => {
        try {
            await educationalResourcesFeedbackStore.getEducationalResources(
                caseId,
            );
        } catch (err) {
            console.error("Failed to load educational resources:", err);
        }
    });
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-200">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-medium text-green-800 flex items-center gap-2">
            <BookOpen class="w-5 h-5" />
            Educational Resources
        </h3>

        {#if educationalCapsules && !isLoading && !error}
            <div class="flex items-center gap-3">
                <Switch
                    bind:checked={isComparativeView}
                    class="data-[state=checked]:bg-green-600"
                    id="compare-switch"
                    aria-label="Toggle compare sections"
                />
                <label
                    for="compare-switch"
                    class="text-base font-medium text-gray-700 cursor-pointer select-none"
                >
                    Compare Sections
                </label>
            </div>
        {/if}
    </div>

    {#if isLoading}
        <div class="flex justify-center items-center p-8">
            <Loader2 class="w-8 h-8 text-green-500 animate-spin" />
            <span class="ml-2">Loading educational resources...</span>
        </div>
    {:else if error}
        <div
            class="bg-red-50 p-4 rounded-md text-red-800 flex items-start gap-2"
        >
            <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p class="font-medium">Error loading resources</p>
                <p class="text-sm">{error}</p>
            </div>
        </div>
    {:else if educationalCapsules}
        {#if isComparativeView}
            <ComparativeView {educationalCapsules} />
        {:else}
            <DiseaseFocusedView {educationalCapsules} />
        {/if}
    {:else}
        <div
            class="bg-gray-50 p-4 rounded-md text-gray-500 flex items-center justify-center"
        >
            <Info class="w-5 h-5 mr-2" />
            <span>No educational resources available</span>
        </div>
    {/if}
</div>
