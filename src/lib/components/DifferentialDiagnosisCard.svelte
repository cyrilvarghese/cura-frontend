<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        AlertCircle,
        Info,
        List,
        Star as StarFilled,
        StarIcon,
        Loader2,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { onMount } from "svelte";
    import { differentialDiagnosisFeedbackStore } from "$lib/stores/differentialDiagnosisFeedbackStore";

    // Optional props
    const { caseId = undefined } = $props();

    // Data comes from the dedicated store using runes
    const differentialDxAnalysis = $derived(
        $differentialDiagnosisFeedbackStore.differentialDiagnosisFeedback
            ?.differentialDxAnalysis,
    );
    const isLoading = $derived($differentialDiagnosisFeedbackStore.isLoading);
    const error = $derived($differentialDiagnosisFeedbackStore.error);

    onMount(async () => {
        try {
            await differentialDiagnosisFeedbackStore.getDifferentialDiagnosisFeedback(
                caseId,
            );
        } catch (err) {
            console.error(
                "Failed to load differential diagnosis feedback:",
                err,
            );
        }
    });
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-200">
    <h3
        class="text-xl font-medium text-purple-800 mb-4 flex items-center gap-2"
    >
        <List class="w-5 h-5" />
        Differential Diagnosis Analysis
    </h3>

    {#if isLoading}
        <div class="flex justify-center items-center p-8">
            <Loader2 class="w-8 h-8 text-purple-500 animate-spin" />
            <span class="ml-2">Loading differential diagnosis analysis...</span>
        </div>
    {:else if error}
        <div
            class="bg-red-50 p-4 rounded-md text-red-800 flex items-start gap-2"
        >
            <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p class="font-medium">Error loading feedback</p>
                <p class="text-sm">{error}</p>
            </div>
        </div>
    {:else if differentialDxAnalysis}
        <div class="space-y-6">
            <!-- Differential List Score -->
            <div class="bg-purple-50/50 p-4 rounded-md">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium">Differential List Score</h4>
                    <div class="flex items-center gap-2">
                        <span class="font-bold"
                            >{differentialDxAnalysis.differentialListScore}/5</span
                        >
                        <div class="flex">
                            {#each Array(5) as _, i}
                                <span class="text-yellow-400">
                                    {#if i < differentialDxAnalysis.differentialListScore}
                                        <StarFilled
                                            class="w-5 h-5 fill-current"
                                        />
                                    {:else}
                                        <StarIcon class="w-5 h-5" />
                                    {/if}
                                </span>
                            {/each}
                        </div>
                    </div>
                </div>
                <p class="text-sm text-gray-700 mt-2">
                    {differentialDxAnalysis.differentialListExplanation}
                </p>
            </div>

            <!-- Plausible Diagnoses that were Considered -->
            <div>
                <h4 class="font-medium mb-3">
                    Plausible Diagnoses (Considered)
                </h4>
                <div class="space-y-3">
                    {#each differentialDxAnalysis.detailedAnalysis as diagnosis}
                        {#if diagnosis.studentDidConsider && diagnosis.isPlausibleDifferential_InContext}
                            <Accordion.Root type="single" collapsible>
                                <Accordion.Item
                                    value={diagnosis.dx}
                                    class="border border-gray-100 rounded-lg overflow-hidden"
                                >
                                    <Accordion.Trigger
                                        class="p-3 bg-blue-50 text-blue-800 flex items-center justify-between text-left"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium"
                                                >{diagnosis.dx}</span
                                            >
                                            <Badge
                                                class="bg-blue-100 text-blue-800 border-blue-200"
                                                >Plausible</Badge
                                            >
                                        </div>
                                    </Accordion.Trigger>
                                    <Accordion.Content class="p-4 bg-white">
                                        <div class="space-y-3">
                                            <div>
                                                <h5 class="font-medium text-sm">
                                                    Analysis:
                                                </h5>
                                                <p
                                                    class="text-sm text-gray-700 mt-1"
                                                >
                                                    {diagnosis.reasoningDetail
                                                        .summaryWhyNotPrimaryOrRuledOut_ForThisCase}
                                                </p>
                                            </div>

                                            {#if diagnosis.reasoningDetail.differentiatingHistoryFromContext.length > 0}
                                                <div>
                                                    <h5
                                                        class="font-medium text-sm"
                                                    >
                                                        Key History Differences:
                                                    </h5>
                                                    <ul class="mt-1 space-y-2">
                                                        {#each diagnosis.reasoningDetail.differentiatingHistoryFromContext as item}
                                                            <li
                                                                class="text-xs border-l-2 border-blue-200 pl-3 py-1"
                                                            >
                                                                <p
                                                                    class="font-medium"
                                                                >
                                                                    {item.desc}
                                                                </p>
                                                                <p
                                                                    class="text-gray-600 mt-0.5"
                                                                >
                                                                    {item.comparisonNote}
                                                                </p>
                                                            </li>
                                                        {/each}
                                                    </ul>
                                                </div>
                                            {/if}

                                            {#if diagnosis.reasoningDetail.differentiatingLabsFromContext.length > 0}
                                                <div>
                                                    <h5
                                                        class="font-medium text-sm"
                                                    >
                                                        Key Lab Differences:
                                                    </h5>
                                                    <ul class="mt-1 space-y-2">
                                                        {#each diagnosis.reasoningDetail.differentiatingLabsFromContext as item}
                                                            <li
                                                                class="text-xs border-l-2 border-green-200 pl-3 py-1"
                                                            >
                                                                <p
                                                                    class="font-medium"
                                                                >
                                                                    {item.testName}:
                                                                    {item.findingForThisDDx}
                                                                </p>
                                                                <p
                                                                    class="text-gray-600 mt-0.5"
                                                                >
                                                                    {item.comparisonNote}
                                                                </p>
                                                            </li>
                                                        {/each}
                                                    </ul>
                                                </div>
                                            {/if}

                                            {#if diagnosis.reasoningDetail.educationalTip}
                                                <div
                                                    class="bg-blue-50 p-3 rounded-md mt-2"
                                                >
                                                    <div class="flex gap-2">
                                                        <Info
                                                            class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                                                        />
                                                        <div>
                                                            <span
                                                                class="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1"
                                                                >Learning Point</span
                                                            >
                                                            <p
                                                                class="text-xs text-blue-800"
                                                            >
                                                                {diagnosis
                                                                    .reasoningDetail
                                                                    .educationalTip}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion.Root>
                        {/if}
                    {/each}
                </div>
            </div>

            <!-- Plausible Diagnoses that were NOT Considered -->
            {#if differentialDxAnalysis.detailedAnalysis.some((dx) => !dx.studentDidConsider && dx.isPlausibleDifferential_InContext)}
                <div>
                    <h4 class="font-medium mb-3">
                        Plausible Diagnoses (Missed)
                    </h4>
                    <div class="space-y-3">
                        {#each differentialDxAnalysis.detailedAnalysis as diagnosis}
                            {#if !diagnosis.studentDidConsider && diagnosis.isPlausibleDifferential_InContext}
                                <Accordion.Root type="single" collapsible>
                                    <Accordion.Item
                                        value={diagnosis.dx}
                                        class="border border-gray-100 rounded-lg overflow-hidden"
                                    >
                                        <Accordion.Trigger
                                            class="p-3 bg-amber-50 text-amber-800 flex items-center justify-between text-left"
                                        >
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <span class="font-medium"
                                                    >{diagnosis.dx}</span
                                                >
                                                <Badge
                                                    class="bg-amber-100 text-amber-800 border-amber-200"
                                                    >Missed</Badge
                                                >
                                            </div>
                                        </Accordion.Trigger>
                                        <Accordion.Content class="p-4 bg-white">
                                            <div class="space-y-3">
                                                <div>
                                                    <h5
                                                        class="font-medium text-sm"
                                                    >
                                                        Analysis:
                                                    </h5>
                                                    <p
                                                        class="text-sm text-gray-700 mt-1"
                                                    >
                                                        {diagnosis
                                                            .reasoningDetail
                                                            .summaryWhyNotPrimaryOrRuledOut_ForThisCase}
                                                    </p>
                                                </div>

                                                {#if diagnosis.reasoningDetail.differentiatingHistoryFromContext && diagnosis.reasoningDetail.differentiatingHistoryFromContext.length > 0}
                                                    <div>
                                                        <h5
                                                            class="font-medium text-sm"
                                                        >
                                                            Key History
                                                            Differences:
                                                        </h5>
                                                        <ul
                                                            class="mt-1 space-y-2"
                                                        >
                                                            {#each diagnosis.reasoningDetail.differentiatingHistoryFromContext as item}
                                                                <li
                                                                    class="text-xs border-l-2 border-amber-200 pl-3 py-1"
                                                                >
                                                                    <p
                                                                        class="font-medium"
                                                                    >
                                                                        {item.desc}
                                                                    </p>
                                                                    <p
                                                                        class="text-gray-600 mt-0.5"
                                                                    >
                                                                        {item.comparisonNote}
                                                                    </p>
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    </div>
                                                {/if}

                                                {#if diagnosis.reasoningDetail.differentiatingLabsFromContext && diagnosis.reasoningDetail.differentiatingLabsFromContext.length > 0}
                                                    <div>
                                                        <h5
                                                            class="font-medium text-sm"
                                                        >
                                                            Key Lab Differences:
                                                        </h5>
                                                        <ul
                                                            class="mt-1 space-y-2"
                                                        >
                                                            {#each diagnosis.reasoningDetail.differentiatingLabsFromContext as item}
                                                                <li
                                                                    class="text-xs border-l-2 border-amber-200 pl-3 py-1"
                                                                >
                                                                    <p
                                                                        class="font-medium"
                                                                    >
                                                                        {item.testName}:
                                                                        {item.findingForThisDDx}
                                                                    </p>
                                                                    <p
                                                                        class="text-gray-600 mt-0.5"
                                                                    >
                                                                        {item.comparisonNote}
                                                                    </p>
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    </div>
                                                {/if}

                                                {#if diagnosis.reasoningDetail.educationalTip}
                                                    <div
                                                        class="bg-blue-50 p-3 rounded-md mt-2"
                                                    >
                                                        <div class="flex gap-2">
                                                            <Info
                                                                class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                                                            />
                                                            <div>
                                                                <span
                                                                    class="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1"
                                                                    >Learning
                                                                    Point</span
                                                                >
                                                                <p
                                                                    class="text-xs text-blue-800"
                                                                >
                                                                    {diagnosis
                                                                        .reasoningDetail
                                                                        .educationalTip}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                </Accordion.Root>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Correctly Ruled Out Diagnoses -->
            {#if differentialDxAnalysis.detailedAnalysis.some((dx) => !dx.isPlausibleDifferential_InContext)}
                <div>
                    <h4 class="font-medium mb-3">Correctly Ruled Out</h4>
                    <div class="space-y-3">
                        {#each differentialDxAnalysis.detailedAnalysis as diagnosis}
                            {#if !diagnosis.isPlausibleDifferential_InContext}
                                <div
                                    class="border border-gray-100 rounded-lg overflow-hidden"
                                >
                                    <div
                                        class="p-3 bg-gray-50 flex items-center justify-between"
                                    >
                                        <span class="font-medium"
                                            >{diagnosis.dx}</span
                                        >
                                        <Badge
                                            class="bg-gray-100 text-gray-800 border-gray-200"
                                            >Not Applicable</Badge
                                        >
                                    </div>
                                    <div class="p-3 text-sm text-gray-600">
                                        <p>
                                            {diagnosis.reasoningDetail
                                                .reasonRuledOutFromContext ||
                                                diagnosis.reasoningDetail
                                                    .summaryWhyNotPrimaryOrRuledOut_ForThisCase}
                                        </p>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <div
            class="bg-gray-50 p-4 rounded-md text-gray-500 flex items-center justify-center"
        >
            <Info class="w-5 h-5 mr-2" />
            <span>No differential diagnosis feedback available</span>
        </div>
    {/if}
</div>
