<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        AlertCircle,
        CheckCircle,
        Info,
        Star as StarFilled,
        StarIcon,
        Stethoscope,
        ClipboardList,
        FileText,
        Loader2,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { onMount } from "svelte";
    import { primaryDiagnosisStore } from "$lib/stores/primaryDiagnosisFeedbackStore";
    import MissedExamsDialog from "$lib/../03-organisms/dialogs/MissedExamsDialog.svelte";
    import MissedLabsDialog from "$lib/../03-organisms/dialogs/MissedLabsDialog.svelte";
    import DiagnosticTimeline from "./DiagnosticTimeline.svelte";
    import mixpanel from "mixpanel-browser";
    import { currentDepartment } from "$lib/stores/teamStore";
    // Optional props
    const { caseId = undefined } = $props();

    // Data comes from the dedicated store using runes
    const primaryDiagnosisFeedback = $derived(
        $primaryDiagnosisStore.primaryDiagnosisFeedback,
    );
    const isLoading = $derived($primaryDiagnosisStore.isLoading);
    const error = $derived($primaryDiagnosisStore.error);

    onMount(async () => {
        try {
            await primaryDiagnosisStore.getPrimaryDiagnosisFeedback(caseId);
            mixpanel.track("Final Diagnosis Feedback", {
                case_id: caseId,
                department: $currentDepartment?.name,
            });
        } catch (err) {
            console.error("Failed to load primary diagnosis feedback:", err);
        }
    });
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-200">
    <h3 class="text-xl font-medium text-blue-800 mb-4 flex items-center gap-2">
        <CheckCircle class="w-5 h-5" />
        Primary Diagnosis Feedback
    </h3>

    {#if isLoading}
        <div class="flex justify-center items-center p-8">
            <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
            <span class="ml-2">Loading diagnosis feedback...</span>
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
    {:else if primaryDiagnosisFeedback}
        <div class="space-y-6">
            <!-- Student's Diagnosis Section -->
            <div class="bg-blue-50/50 p-4 rounded-md">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium">Student's Diagnosis</h4>
                    {#if primaryDiagnosisFeedback.primaryDxFeedback.studentStated.isCorrect}
                        <Badge
                            variant="outline"
                            class="bg-green-100 text-green-800 border-green-200"
                            >Correct</Badge
                        >
                    {:else}
                        <Badge
                            variant="outline"
                            class="bg-red-100 text-red-800 border-red-200"
                            >Incorrect</Badge
                        >
                    {/if}
                </div>
                <p class="text-lg font-semibold">
                    {primaryDiagnosisFeedback.primaryDxFeedback.studentStated
                        .dx}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                    Correct Diagnosis: {primaryDiagnosisFeedback
                        .primaryDxFeedback.correctPrimary.dx}
                </p>
            </div>

            <!-- Performance Scores as a grid of cards -->
            <div class="mb-8">
                <h4 class="font-medium mb-3">Performance Scores</h4>
                <div class="flex flex-wrap gap-[60px] justify-start">
                    <!-- Accuracy Card -->
                    <div
                        class="w-80 bg-blue-50 border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div
                            class="px-4 py-3 border-b border-blue-100 flex justify-between items-center"
                        >
                            <span class="font-medium text-blue-800"
                                >Accuracy</span
                            >
                            <span class="font-bold text-blue-800">
                                {primaryDiagnosisFeedback.primaryDxFeedback
                                    .scores.accuracyScore}/5
                            </span>
                        </div>
                        <div class="px-4 py-3">
                            <div class="flex mb-2">
                                {#each Array(5) as _, i}
                                    <span class="text-blue-500">
                                        {#if i < primaryDiagnosisFeedback.primaryDxFeedback.scores.accuracyScore}
                                            <StarFilled
                                                class="w-5 h-5 fill-current"
                                            />
                                        {:else}
                                            <StarIcon class="w-5 h-5" />
                                        {/if}
                                    </span>
                                {/each}
                            </div>
                            <p class="text-sm text-gray-700">
                                {primaryDiagnosisFeedback.primaryDxFeedback
                                    .scores.accuracyExplanation}
                            </p>
                        </div>
                    </div>

                    <!-- Evidence Gathering Card -->
                    <div
                        class="w-80 bg-red-50 border border-red-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div
                            class="px-4 py-3 border-b border-red-100 flex justify-between items-center"
                        >
                            <span class="font-medium text-red-800"
                                >Evidence Gathering</span
                            >
                            <span class="font-bold text-red-800">
                                {primaryDiagnosisFeedback.primaryDxFeedback
                                    .scores.evidenceGatheringScore}/5
                            </span>
                        </div>
                        <div class="px-4 py-3">
                            <div class="flex mb-2">
                                {#each Array(5) as _, i}
                                    <span class="text-red-500">
                                        {#if i < primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringScore}
                                            <StarFilled
                                                class="w-5 h-5 fill-current"
                                            />
                                        {:else}
                                            <StarIcon class="w-5 h-5" />
                                        {/if}
                                    </span>
                                {/each}
                            </div>
                            <p class="text-sm text-gray-700">
                                {primaryDiagnosisFeedback.primaryDxFeedback
                                    .scores.evidenceGatheringExplanation
                                    .overallSummary}
                            </p>
                        </div>
                    </div>

                    <!-- Strengths and Weaknesses Card -->
                    <div
                        class="w-80 bg-amber-50 border border-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div
                            class="px-4 py-3 border-b border-amber-100 flex justify-between items-center"
                        >
                            <span class="font-medium text-amber-800"
                                >Strengths & Areas for Improvement</span
                            >
                            <Info class="w-5 h-5 text-amber-600" />
                        </div>
                        <div class="px-4 py-3 space-y-4">
                            <!-- Strengths Section -->
                            <div>
                                <h5
                                    class="text-sm font-semibold text-green-800 mb-2"
                                >
                                    Strengths
                                </h5>
                                <div class="space-y-2">
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.historyStrengths.length > 0}
                                        <div>
                                            <p
                                                class="text-xs text-green-700 font-medium mb-1"
                                            >
                                                Patient History:
                                            </p>
                                            <ul
                                                class="text-xs text-gray-700 space-y-1"
                                            >
                                                {#each primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.historyStrengths as strength}
                                                    <li
                                                        class="flex items-start gap-1"
                                                    >
                                                        <span
                                                            class="text-green-600 mt-1"
                                                            >✓</span
                                                        >
                                                        <span>{strength}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.examStrengths.length > 0}
                                        <div>
                                            <p
                                                class="text-xs text-green-700 font-medium mb-1"
                                            >
                                                Physical Examinations:
                                            </p>
                                            <ul
                                                class="text-xs text-gray-700 space-y-1"
                                            >
                                                {#each primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.examStrengths as strength}
                                                    <li
                                                        class="flex items-start gap-1"
                                                    >
                                                        <span
                                                            class="text-green-600 mt-1"
                                                            >✓</span
                                                        >
                                                        <span>{strength}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.testStrengths.length > 0}
                                        <div>
                                            <p
                                                class="text-xs text-green-700 font-medium mb-1"
                                            >
                                                Laboratory Tests:
                                            </p>
                                            <ul
                                                class="text-xs text-gray-700 space-y-1"
                                            >
                                                {#each primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.testStrengths as strength}
                                                    <li
                                                        class="flex items-start gap-1"
                                                    >
                                                        <span
                                                            class="text-green-600 mt-1"
                                                            >✓</span
                                                        >
                                                        <span>{strength}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.historyStrengths.length === 0 && primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.examStrengths.length === 0 && primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.testStrengths.length === 0}
                                        <p class="text-xs text-gray-600 italic">
                                            No specific strengths identified.
                                        </p>
                                    {/if}
                                </div>
                            </div>

                            <!-- Areas for Improvement Section -->
                            <div>
                                <h5
                                    class="text-sm font-semibold text-amber-800 mb-2"
                                >
                                    Areas for Improvement
                                </h5>
                                <div class="space-y-2">
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Exams.length > 0}
                                        <div>
                                            <p
                                                class="text-xs text-amber-700 font-medium mb-1"
                                            >
                                                Physical Examinations:
                                            </p>
                                            <ul
                                                class="text-xs text-gray-700 space-y-1"
                                            >
                                                {#each primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Exams as area}
                                                    <li
                                                        class="flex items-start gap-1"
                                                    >
                                                        <span
                                                            class="text-amber-600 mt-1"
                                                            >•</span
                                                        >
                                                        <span>{area}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Tests.length > 0}
                                        <div>
                                            <p
                                                class="text-xs text-amber-700 font-medium mb-1"
                                            >
                                                Laboratory Tests:
                                            </p>
                                            <ul
                                                class="text-xs text-gray-700 space-y-1"
                                            >
                                                {#each primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Tests as area}
                                                    <li
                                                        class="flex items-start gap-1"
                                                    >
                                                        <span
                                                            class="text-amber-600 mt-1"
                                                            >•</span
                                                        >
                                                        <span>{area}</span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {/if}
                                    {#if primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Exams.length === 0 && primaryDiagnosisFeedback.primaryDxFeedback.scores.evidenceGatheringExplanation.areasForImprovement_Tests.length === 0}
                                        <p class="text-xs text-gray-600 italic">
                                            No specific areas for improvement
                                            identified.
                                        </p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Supporting Evidence -->
            <div class="space-y-4">
                <h4 class="font-medium mb-1">Supporting Evidence</h4>
                <div class="flex flex-wrap gap-[60px] justify-start">
                    <!-- History Evidence Card -->
                    <div
                        class="w-80 bg-blue-50/50 p-0 rounded-md border flex flex-col items-start border-blue-100 shadow-sm"
                    >
                        <div
                            class="px-4 py-3 w-full border-b border-gray-200 flex items-center gap-1 text-blue-700 font-medium"
                        >
                            <FileText class="w-4 h-4" />
                            Patient History
                        </div>
                        <div class="p-4">
                            <ul class="space-y-3">
                                {#each primaryDiagnosisFeedback.primaryDxFeedback.correctPrimary.allSupportingEvidence.history as item}
                                    <li class="flex gap-2">
                                        <div class="mt-0.5">
                                            {#if item.studentDidIdentify}
                                                <div
                                                    class="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center"
                                                >
                                                    <CheckCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center"
                                                >
                                                    <AlertCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {/if}
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">
                                                {item.desc}
                                            </p>
                                            <p
                                                class="text-xs text-gray-600 mt-0.5"
                                            >
                                                {item.alignsWithKeyEvidence}
                                            </p>
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <!-- Physical Exams Evidence Card -->
                    <div
                        class="w-80 bg-gray-50 p-0 rounded-md border border-gray-200 shadow-sm"
                    >
                        <div
                            class="px-4 py-3 border-b border-gray-200 flex items-center gap-1 text-blue-700 font-medium"
                        >
                            <Stethoscope class="w-4 h-4" />
                            Physical Examinations
                        </div>
                        <div class="p-4">
                            <ul class="space-y-3">
                                {#each primaryDiagnosisFeedback.primaryDxFeedback.correctPrimary.allSupportingEvidence.exams as item}
                                    <li class="flex gap-2">
                                        <div class="mt-0.5">
                                            {#if item.studentDidPerform}
                                                <div
                                                    class="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center"
                                                >
                                                    <CheckCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center"
                                                >
                                                    <AlertCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {/if}
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">
                                                {item.name}
                                            </p>
                                            <p
                                                class="text-xs text-gray-600 mt-0.5"
                                            >
                                                Finding: {item.expectedFindingSupportingDx}
                                            </p>
                                            {#if item.studentDidPerform && !item.studentDidIdentifyFinding}
                                                <p
                                                    class="text-xs text-red-700 mt-0.5 italic"
                                                >
                                                    You performed this exam but
                                                    didn't identify the key
                                                    finding.
                                                </p>
                                            {/if}
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <!-- Lab Tests Evidence Card -->
                    <div
                        class="w-80 bg-gray-50 p-0 rounded-md border border-gray-200 shadow-sm"
                    >
                        <div
                            class="px-4 py-3 border-b border-gray-200 flex items-center gap-1 text-blue-700 font-medium"
                        >
                            <ClipboardList class="w-4 h-4" />
                            Laboratory Tests
                        </div>
                        <div class="p-4">
                            <ul class="space-y-3">
                                {#each primaryDiagnosisFeedback.primaryDxFeedback.correctPrimary.allSupportingEvidence.tests as item}
                                    <li class="flex gap-2">
                                        <div class="mt-0.5">
                                            {#if item.studentDidOrder}
                                                <div
                                                    class="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center"
                                                >
                                                    <CheckCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center"
                                                >
                                                    <AlertCircle
                                                        class="w-4 h-4"
                                                    />
                                                </div>
                                            {/if}
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">
                                                {item.name}
                                            </p>
                                            <p
                                                class="text-xs text-gray-600 mt-0.5"
                                            >
                                                Expected Result: {item.expectedResultSupportingDx}
                                            </p>
                                            {#if item.studentDidOrder && !item.studentDidIdentifyResult}
                                                <p
                                                    class="text-xs text-red-700 mt-0.5 italic"
                                                >
                                                    You ordered this test but
                                                    didn't interpret the result
                                                    correctly.
                                                </p>
                                            {/if}
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Missed Exams -->
            {#if primaryDiagnosisFeedback.primaryDxFeedback.missedCrucialEvidence.missedExams.length > 0}
                <MissedExamsDialog
                    missedExams={primaryDiagnosisFeedback.primaryDxFeedback
                        .missedCrucialEvidence.missedExams}
                />
            {/if}

            <!-- Missed Labs -->
            {#if primaryDiagnosisFeedback.primaryDxFeedback.missedCrucialEvidence.missedLabs && primaryDiagnosisFeedback.primaryDxFeedback.missedCrucialEvidence.missedLabs.length > 0}
                <MissedLabsDialog
                    missedLabs={primaryDiagnosisFeedback.primaryDxFeedback
                        .missedCrucialEvidence.missedLabs}
                />
            {/if}

            <!-- Diagnostic Timeline -->
            {@debug primaryDiagnosisFeedback}
            {#if primaryDiagnosisFeedback?.primaryDxFeedback?.idealDiagnosticTimeline}
                <DiagnosticTimeline {primaryDiagnosisFeedback} />
            {/if}
        </div>
    {:else}
        <div
            class="bg-gray-50 p-4 rounded-md text-gray-500 flex items-center justify-center"
        >
            <Info class="w-5 h-5 mr-2" />
            <span>No primary diagnosis feedback available</span>
        </div>
    {/if}
</div>
