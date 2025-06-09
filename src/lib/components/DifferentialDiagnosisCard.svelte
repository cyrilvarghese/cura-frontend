<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        AlertCircle,
        Info,
        List,
        Star as StarFilled,
        StarIcon,
        Loader2,
        CheckCircle,
        XCircle,
        Target,
        User,
        Stethoscope,
        FlaskConical,
        RefreshCw,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
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

    // Derived data for different diagnosis types
    const primaryDiagnosis = $derived(
        differentialDxAnalysis?.detailedAnalysis.find(
            (dx) => dx.type === "PrimaryDiagnosis",
        ),
    );
    const plausibleDifferentials = $derived(
        differentialDxAnalysis?.detailedAnalysis.filter(
            (dx) => dx.type === "PlausibleDifferential",
        ) || [],
    );
    const ruledOutDifferentials = $derived(
        differentialDxAnalysis?.detailedAnalysis.filter(
            (dx) => dx.type === "RuledOutDifferential",
        ) || [],
    );

    // State for tracking open popovers
    let openPopover: string | null = $state(null);

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

    async function handleRetry() {
        try {
            await differentialDiagnosisFeedbackStore.getDifferentialDiagnosisFeedback(
                caseId,
            );
        } catch (err) {
            console.error(
                "Failed to retry differential diagnosis feedback:",
                err,
            );
        }
    }

    function splitBySemicolon(text: string) {
        return text.split(";").join(";\n");
    }
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
            <div class="flex-1">
                <p class="font-medium">Error loading feedback</p>
                <p class="text-sm">{error}</p>
            </div>
            <Button
                variant="outline"
                size="sm"
                onclick={handleRetry}
                class="ml-2 border-red-200 text-red-700 hover:bg-red-100"
            >
                <RefreshCw class="w-4 h-4 mr-2" />
                Retry
            </Button>
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
                                    {#if i < parseInt(differentialDxAnalysis.differentialListScore)}
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

            <!-- Primary Diagnosis -->
            {#if primaryDiagnosis}
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div class="flex items-center gap-2 mb-3">
                        <Target class="w-5 h-5 text-green-600" />
                        <h4 class="font-semibold text-green-800">
                            {primaryDiagnosis.dxName}
                        </h4>
                        <Badge
                            class="bg-green-100 hover:bg-green-400 text-green-800 border-green-300"
                        >
                            Primary Diagnosis
                        </Badge>
                    </div>

                    {#if primaryDiagnosis.supportingFeatures_ThisCase}
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                                <h5
                                    class="font-medium text-sm text-green-700 mb-2"
                                >
                                    History
                                </h5>
                                <ul class="space-y-1">
                                    {#each primaryDiagnosis.supportingFeatures_ThisCase.history as item}
                                        <li
                                            class="text-sm bg-white p-2 rounded border-l-2 border-green-300"
                                        >
                                            {item}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                            <div>
                                <h5
                                    class="font-medium text-sm text-green-700 mb-2"
                                >
                                    Exam
                                </h5>
                                <ul class="space-y-1">
                                    {#each primaryDiagnosis.supportingFeatures_ThisCase.exam as item}
                                        <li
                                            class="text-sm bg-white p-2 rounded border-l-2 border-green-300"
                                        >
                                            {item}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                            <div>
                                <h5
                                    class="font-medium text-sm text-green-700 mb-2"
                                >
                                    Lab
                                </h5>
                                <ul class="space-y-1">
                                    {#each primaryDiagnosis.supportingFeatures_ThisCase.lab as item}
                                        <li
                                            class="text-sm bg-white p-2 rounded border-l-2 border-green-300"
                                        >
                                            {item}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            <!-- Plausible Differentials Table -->
            {#if plausibleDifferentials.length > 0}
                <div class="mt-8">
                    <h4
                        class="font-medium text-amber-700 mb-3 mt-12 flex items-center gap-2"
                    >
                        <AlertCircle class="w-4 h-4" />
                        Typical Features of Plausible Differentials (should consider)
                    </h4>
                    <div class="overflow-x-auto">
                        <table
                            class="w-full border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <thead class="bg-amber-50">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        Diagnosis
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        Student Considered
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        <div class="flex items-center gap-1">
                                            <User class="w-4 h-4" />
                                            History
                                        </div>
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        <div class="flex items-center gap-1">
                                            <Stethoscope class="w-4 h-4" />
                                            Exam
                                        </div>
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        <div class="flex items-center gap-1">
                                            <FlaskConical class="w-4 h-4" />
                                            Lab
                                        </div>
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-amber-800 border-b"
                                    >
                                        Why Not This?
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                {#each plausibleDifferentials as diagnosis, i}
                                    <tr
                                        class={i % 2 === 0
                                            ? "bg-white"
                                            : "bg-amber-25"}
                                    >
                                        <td class="px-4 py-3 border-b">
                                            <span class="font-medium text-sm"
                                                >{diagnosis.dxName}</span
                                            >
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.studentDidConsiderAsPlausible}
                                                <div
                                                    class="flex items-center gap-1 text-green-600"
                                                >
                                                    <CheckCircle
                                                        class="w-4 h-4"
                                                    />
                                                    <span class="text-xs"
                                                        >Yes</span
                                                    >
                                                </div>
                                            {:else}
                                                <div
                                                    class="flex items-center gap-1 text-red-600"
                                                >
                                                    <XCircle class="w-4 h-4" />
                                                    <span class="text-xs"
                                                        >No</span
                                                    >
                                                </div>
                                            {/if}
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.differentiatingFeatures_General?.history}
                                                <ul class="space-y-1">
                                                    {#each diagnosis.differentiatingFeatures_General.history as item}
                                                        <li
                                                            class="text-xs bg-amber-50 p-1 rounded border-l-2 border-amber-300"
                                                        >
                                                            {item}
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {:else}
                                                <span
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.differentiatingFeatures_General?.exam}
                                                <ul class="space-y-1">
                                                    {#each diagnosis.differentiatingFeatures_General.exam as item}
                                                        <li
                                                            class="text-xs bg-amber-50 p-1 rounded border-l-2 border-amber-300"
                                                        >
                                                            {item}
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {:else}
                                                <span
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.differentiatingFeatures_General?.lab}
                                                <ul class="space-y-1">
                                                    {#each diagnosis.differentiatingFeatures_General.lab as item}
                                                        <li
                                                            class="text-xs bg-amber-50 p-1 rounded border-l-2 border-amber-300 whitespace-pre-line"
                                                        >
                                                            {splitBySemicolon(
                                                                item,
                                                            )}
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {:else}
                                                <span
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.caseSpecificDifferentiation?.quickDifferentiatingTags_ThisCase}
                                                <div
                                                    class="flex flex-wrap gap-1"
                                                >
                                                    {#each diagnosis.caseSpecificDifferentiation.quickDifferentiatingTags_ThisCase as tag}
                                                        <Popover.Root>
                                                            <Popover.Trigger>
                                                                <Badge
                                                                    class="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs cursor-pointer"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            </Popover.Trigger>
                                                            <Popover.Content
                                                                class="w-80 p-4"
                                                            >
                                                                <div
                                                                    class="space-y-3"
                                                                >
                                                                    <h5
                                                                        class="font-medium text-sm"
                                                                    >
                                                                        Case
                                                                        Explanation
                                                                    </h5>
                                                                    <p
                                                                        class="text-xs text-gray-700"
                                                                    >
                                                                        {diagnosis
                                                                            .caseSpecificDifferentiation
                                                                            ?.detailedExplanation_ThisCase ||
                                                                            "No explanation provided"}
                                                                    </p>
                                                                    {#if diagnosis.caseSpecificDifferentiation?.educationalTip}
                                                                        <div
                                                                            class="p-2 bg-blue-50 rounded text-xs"
                                                                        >
                                                                            <span
                                                                                class="text-blue-800"
                                                                                >{diagnosis
                                                                                    .caseSpecificDifferentiation
                                                                                    .educationalTip}</span
                                                                            >
                                                                        </div>
                                                                    {/if}
                                                                </div>
                                                            </Popover.Content>
                                                        </Popover.Root>
                                                    {/each}
                                                </div>
                                            {:else}
                                                <span
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}

            <!-- Ruled Out Differentials Table -->
            {#if ruledOutDifferentials.length > 0}
                <div>
                    <h4
                        class="font-medium text-gray-700 mb-3 mt-12 flex items-center gap-2"
                    >
                        <XCircle class="w-4 h-4" />
                        To be Ruled Out (should not consider)
                    </h4>
                    <div class="overflow-x-auto">
                        <table
                            class="w-full border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-gray-800 border-b"
                                    >
                                        Diagnosis
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-gray-800 border-b"
                                    >
                                        Student Marked Incorrect
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-sm font-medium text-gray-800 border-b"
                                    >
                                        Why Ruled Out ?
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                {#each ruledOutDifferentials as diagnosis, i}
                                    <tr
                                        class={i % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-25"}
                                    >
                                        <td class="px-4 py-3 border-b">
                                            <span class="font-medium text-sm"
                                                >{diagnosis.dxName}</span
                                            >
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.studentDidMarkAsIncorrect}
                                                <span
                                                    class="inline-flex items-center gap-1 text-green-600 text-xs font-medium"
                                                >
                                                    <CheckCircle
                                                        class="w-4 h-4"
                                                    /> Yes
                                                </span>
                                            {:else}
                                                <span
                                                    class="inline-flex items-center gap-1 text-red-600 text-xs font-medium"
                                                >
                                                    <XCircle class="w-4 h-4" /> No
                                                </span>
                                            {/if}
                                        </td>
                                        <td class="px-4 py-3 border-b">
                                            {#if diagnosis.caseSpecificDifferentiation?.quickDifferentiatingTags_ThisCase}
                                                <div
                                                    class="flex flex-wrap gap-1"
                                                >
                                                    {#each diagnosis.caseSpecificDifferentiation.quickDifferentiatingTags_ThisCase as tag}
                                                        <Popover.Root>
                                                            <Popover.Trigger>
                                                                <Badge
                                                                    class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs cursor-pointer"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            </Popover.Trigger>
                                                            <Popover.Content
                                                                class="w-80 p-4"
                                                            >
                                                                <div
                                                                    class="space-y-3"
                                                                >
                                                                    <h5
                                                                        class="font-medium text-sm"
                                                                    >
                                                                        Why
                                                                        Ruled
                                                                        Out
                                                                    </h5>
                                                                    <p
                                                                        class="text-xs text-gray-700"
                                                                    >
                                                                        {diagnosis
                                                                            .caseSpecificDifferentiation
                                                                            ?.detailedExplanation_ThisCase ||
                                                                            "No explanation provided"}
                                                                    </p>
                                                                </div>
                                                            </Popover.Content>
                                                        </Popover.Root>
                                                    {/each}
                                                </div>
                                            {:else}
                                                <span
                                                    class="text-xs text-gray-400"
                                                    >-</span
                                                >
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
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
