<script lang="ts">
    import type { DiagnosisFeedbackResponse } from "$lib/services/feedbackService";
    import { Progress } from "$lib/components/ui/progress";
    import { Separator } from "$lib/components/ui/separator";
    import {
        AlertCircle,
        Award,
        CheckCircle,
        Info,
        Star as StarFilled,
        StarIcon,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";

    export let feedback: DiagnosisFeedbackResponse;
</script>

<div class="space-y-8">
    <!-- Summary Section -->
    <div class=" p-6 rounded-lg shadow-sm border-l-4 border-blue-200">
        <h3
            class="text-xl font-medium text-blue-800 mb-4 flex items-center gap-2"
        >
            <Award class="w-5 h-5" />
            Evaluation Summary
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium"
                        >Physical Exam Performance</span
                    >
                    <span class="text-sm font-bold"
                        >{feedback.feedback_result.evaluationSummary
                            .physicalExamPerformance}/5</span
                    >
                </div>
                <div class="flex">
                    {#each Array(5) as _, i}
                        <span class="text-yellow-400">
                            {#if i < feedback.feedback_result.evaluationSummary.physicalExamPerformance}
                                <StarFilled class="w-5 h-5 fill-current" />
                            {:else}
                                <StarIcon class="w-5 h-5" />
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium"
                        >Test Ordering Performance</span
                    >
                    <span class="text-sm font-bold"
                        >{feedback.feedback_result.evaluationSummary
                            .testOrderingPerformance}/5</span
                    >
                </div>
                <div class="flex">
                    {#each Array(5) as _, i}
                        <span class="text-yellow-400">
                            {#if i < feedback.feedback_result.evaluationSummary.testOrderingPerformance}
                                <StarFilled class="w-5 h-5 fill-current" />
                            {:else}
                                <StarIcon class="w-5 h-5" />
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium"
                        >Primary Diagnosis Accuracy</span
                    >
                    <span class="text-sm font-bold"
                        >{feedback.feedback_result.evaluationSummary
                            .primaryDiagnosisAccuracy}/5</span
                    >
                </div>
                <div class="flex">
                    {#each Array(5) as _, i}
                        <span class="text-yellow-400">
                            {#if i < feedback.feedback_result.evaluationSummary.primaryDiagnosisAccuracy}
                                <StarFilled class="w-5 h-5 fill-current" />
                            {:else}
                                <StarIcon class="w-5 h-5" />
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">Reasoning Quality</span>
                    <span class="text-sm font-bold"
                        >{feedback.feedback_result.evaluationSummary
                            .reasoningQuality}/5</span
                    >
                </div>
                <div class="flex">
                    {#each Array(5) as _, i}
                        <span class="text-yellow-400">
                            {#if i < feedback.feedback_result.evaluationSummary.reasoningQuality}
                                <StarFilled class="w-5 h-5 fill-current" />
                            {:else}
                                <StarIcon class="w-5 h-5" />
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium"
                        >Differential List Match</span
                    >
                    <span class="text-sm font-bold"
                        >{feedback.feedback_result.evaluationSummary
                            .differentialListMatch}/5</span
                    >
                </div>
                <div class="flex">
                    {#each Array(5) as _, i}
                        <span class="text-yellow-400">
                            {#if i < feedback.feedback_result.evaluationSummary.differentialListMatch}
                                <StarFilled class="w-5 h-5 fill-current" />
                            {:else}
                                <StarIcon class="w-5 h-5" />
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <Separator class="my-8" />

    <!-- Detailed Sections -->
    <div class="space-y-8">
        <!-- Physical Exams -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border-l-2 border-blue-200"
        >
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium flex items-center gap-2">
                    <span
                        class="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center"
                    >
                        {feedback.feedback_result.scoreBreakdown.physicalExams
                            .score}
                    </span>
                    Physical Exams
                </h3>
                <span
                    class="text-sm font-medium px-2.5 py-0.5 rounded-full
                    {feedback.feedback_result.scoreBreakdown.physicalExams
                        .score >= 4
                        ? 'bg-blue-50 text-blue-700'
                        : feedback.feedback_result.scoreBreakdown.physicalExams
                                .score >= 3
                          ? 'bg-blue-50 text-blue-700'
                          : feedback.feedback_result.scoreBreakdown
                                  .physicalExams.score >= 2
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'}"
                >
                    {feedback.feedback_result.scoreBreakdown.physicalExams
                        .score >= 4
                        ? "Excellent"
                        : feedback.feedback_result.scoreBreakdown.physicalExams
                                .score >= 3
                          ? "Good"
                          : feedback.feedback_result.scoreBreakdown
                                  .physicalExams.score >= 2
                            ? "Fair"
                            : "Needs Improvement"}
                </span>
            </div>
            <p class="text-sm mb-5 text-gray-700">
                {feedback.feedback_result.scoreBreakdown.physicalExams
                    .explanation}
            </p>

            {#if feedback.feedback_result.scoreBreakdown.physicalExams.missedItems.length > 0}
                <div class="mt-4">
                    <Accordion.Root type="single">
                        <Accordion.Item
                            value="missed-items"
                            class="border-none"
                        >
                            <Accordion.Trigger
                                class="py-3 bg-amber-50 justify-start px-4 text-amber-800 font-medium text-base flex items-center gap-2  rounded-t-md"
                            >
                                <AlertCircle class="w-5 h-5" />
                                Missed Items
                            </Accordion.Trigger>
                            <Accordion.Content
                                class="border-x border-b border-amber-200 rounded-b-md p-4"
                            >
                                <ul class="space-y-6">
                                    {#each feedback.feedback_result.scoreBreakdown.physicalExams.missedItems as item}
                                        <li
                                            class="border-l-4 border-amber-400 pl-4 py-2"
                                        >
                                            <div
                                                class="flex items-center gap-2 mb-2"
                                            >
                                                <span
                                                    class="font-semibold text-base"
                                                    >{item.name}</span
                                                >
                                                <Badge
                                                    variant="outline"
                                                    class="border-amber-300 text-amber-800"
                                                    >Key exam</Badge
                                                >
                                            </div>
                                            <p
                                                class="text-gray-700 text-sm mb-2"
                                            >
                                                <span
                                                    class="font-medium text-amber-700"
                                                    >Relevance:</span
                                                >
                                                {item.specificRelevance}
                                            </p>
                                            <!-- <p class="text-gray-600 text-sm">
                                                <span
                                                    class="font-medium text-gray-700"
                                                    >Description:</span
                                                >
                                                {item.generalDescription}
                                            </p> -->
                                        </li>
                                    {/each}
                                </ul>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </div>
            {/if}
        </div>

        <!-- Tests Ordered -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border-l-2 border-green-200"
        >
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium flex items-center gap-2">
                    <span
                        class="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center"
                    >
                        {feedback.feedback_result.scoreBreakdown.testsOrdered
                            .score}
                    </span>
                    Tests Ordered
                </h3>
                <span
                    class="text-sm font-medium px-2.5 py-0.5 rounded-full
                        {feedback.feedback_result.scoreBreakdown.testsOrdered
                        .score >= 4
                        ? 'bg-green-50 text-green-700'
                        : feedback.feedback_result.scoreBreakdown.testsOrdered
                                .score >= 3
                          ? 'bg-green-50 text-green-700'
                          : feedback.feedback_result.scoreBreakdown.testsOrdered
                                  .score >= 2
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'}"
                >
                    {feedback.feedback_result.scoreBreakdown.testsOrdered
                        .score >= 4
                        ? "Excellent"
                        : feedback.feedback_result.scoreBreakdown.testsOrdered
                                .score >= 3
                          ? "Good"
                          : feedback.feedback_result.scoreBreakdown.testsOrdered
                                  .score >= 2
                            ? "Fair"
                            : "Needs Improvement"}
                </span>
            </div>
            <p class="text-sm mb-5 text-gray-700">
                {feedback.feedback_result.scoreBreakdown.testsOrdered
                    .explanation}
            </p>

            {#if feedback.feedback_result.scoreBreakdown.testsOrdered.missedItems.length > 0}
                <div class="mt-4">
                    <Accordion.Root type="single">
                        <Accordion.Item
                            value="missed-tests"
                            class="border-none"
                        >
                            <Accordion.Trigger
                                class="py-3 bg-amber-50 justify-start px-4 text-amber-800 font-medium text-base flex items-center gap-2  rounded-t-md"
                            >
                                <AlertCircle class="w-5 h-5" />
                                Missed Items
                            </Accordion.Trigger>
                            <Accordion.Content
                                class="border-x border-b border-amber-200 rounded-b-md p-4"
                            >
                                <ul class="space-y-6">
                                    {#each feedback.feedback_result.scoreBreakdown.testsOrdered.missedItems as item}
                                        <li
                                            class="border-l-4 border-amber-400 pl-4 py-2"
                                        >
                                            <div
                                                class="flex items-center gap-2 mb-2"
                                            >
                                                <span
                                                    class="font-semibold text-base"
                                                    >{item.name}</span
                                                >
                                                <Badge
                                                    variant="outline"
                                                    class="border-amber-300 text-amber-800"
                                                    >Key test</Badge
                                                >
                                            </div>
                                            <p
                                                class="text-gray-700 text-sm mb-2"
                                            >
                                                <span
                                                    class="font-medium text-amber-700"
                                                    >Relevance:</span
                                                >
                                                {item.specificRelevance}
                                            </p>
                                            <!-- <p class="text-gray-600 text-sm">
                                                <span
                                                    class="font-medium text-gray-700"
                                                    >Description:</span
                                                >
                                                {item.generalDescription}
                                            </p> -->
                                        </li>
                                    {/each}
                                </ul>
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </div>
            {/if}
        </div>

        <!-- Diagnosis Accuracy -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border-l-2 {feedback
                .feedback_result.scoreBreakdown.diagnosisAccuracy.score >= 4
                ? 'border-green-300'
                : 'border-purple-200'} {feedback.feedback_result.scoreBreakdown
                .diagnosisAccuracy.score >= 4
                ? 'bg-green-50/30'
                : ''}"
        >
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium flex items-center gap-2">
                    <span
                        class="{feedback.feedback_result.scoreBreakdown
                            .diagnosisAccuracy.score >= 4
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'} w-7 h-7 rounded-full flex items-center justify-center"
                    >
                        {feedback.feedback_result.scoreBreakdown
                            .diagnosisAccuracy.score}
                    </span>
                    Diagnosis Accuracy
                    {#if feedback.feedback_result.scoreBreakdown.diagnosisAccuracy.score >= 4}
                        <CheckCircle class="w-5 h-5 text-green-600" />
                    {/if}
                </h3>
                <span
                    class="text-sm font-medium px-2.5 py-0.5 rounded-full {feedback
                        .feedback_result.scoreBreakdown.diagnosisAccuracy
                        .score >= 4
                        ? 'bg-green-50 text-green-700'
                        : 'bg-purple-50 text-purple-700'}"
                >
                    {feedback.feedback_result.scoreBreakdown.diagnosisAccuracy
                        .score >= 4
                        ? "Correct Diagnosis"
                        : feedback.feedback_result.scoreBreakdown
                                .diagnosisAccuracy.score >= 3
                          ? "Close Diagnosis"
                          : feedback.feedback_result.scoreBreakdown
                                  .diagnosisAccuracy.score >= 2
                            ? "Partially Correct"
                            : "Incorrect"}
                </span>
            </div>
            <p class="text-sm mb-4 text-gray-700">
                {feedback.feedback_result.scoreBreakdown.diagnosisAccuracy
                    .explanation}
            </p>

            {#if feedback.feedback_result.scoreBreakdown.diagnosisAccuracy.educationalTip}
                <div class="bg-blue-50 p-4 rounded-md mt-4">
                    <div class="flex gap-3">
                        <Info
                            class="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <span
                                class="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1"
                                >Learning Point</span
                            >
                            <p class="text-sm text-blue-800">
                                {feedback.feedback_result.scoreBreakdown
                                    .diagnosisAccuracy.educationalTip}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Reasoning Quality -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border-l-2 border-amber-200"
        >
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium flex items-center gap-2">
                    <span
                        class="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center"
                    >
                        {feedback.feedback_result.scoreBreakdown
                            .reasoningQuality.score}
                    </span>
                    Reasoning Quality
                </h3>
                <span
                    class="text-sm font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700"
                >
                    {feedback.feedback_result.scoreBreakdown.reasoningQuality
                        .score >= 4
                        ? "Excellent"
                        : feedback.feedback_result.scoreBreakdown
                                .reasoningQuality.score >= 3
                          ? "Good"
                          : feedback.feedback_result.scoreBreakdown
                                  .reasoningQuality.score >= 2
                            ? "Fair"
                            : "Needs Improvement"}
                </span>
            </div>
            <p class="text-sm mb-4 text-gray-700">
                {feedback.feedback_result.scoreBreakdown.reasoningQuality
                    .explanation}
            </p>

            {#if feedback.feedback_result.scoreBreakdown.reasoningQuality.educationalTip}
                <div class="bg-blue-50 p-4 rounded-md mt-4">
                    <div class="flex gap-3">
                        <Info
                            class="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <span
                                class="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1"
                                >Learning Point</span
                            >
                            <p class="text-sm text-blue-800">
                                {feedback.feedback_result.scoreBreakdown
                                    .reasoningQuality.educationalTip}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Differentials -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border-l-2 border-indigo-200"
        >
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium flex items-center gap-2">
                    <span
                        class="bg-blue-100 text-blue-800 w-7 h-7 rounded-full flex items-center justify-center"
                    >
                        {feedback.feedback_result.scoreBreakdown.differentials
                            .score}
                    </span>
                    Differentials
                </h3>
                <span
                    class="text-sm font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700"
                >
                    {feedback.feedback_result.scoreBreakdown.differentials
                        .score >= 4
                        ? "Excellent"
                        : feedback.feedback_result.scoreBreakdown.differentials
                                .score >= 3
                          ? "Good"
                          : feedback.feedback_result.scoreBreakdown
                                  .differentials.score >= 2
                            ? "Fair"
                            : "Needs Improvement"}
                </span>
            </div>
            <p class="text-sm mb-4 text-gray-700">
                {feedback.feedback_result.scoreBreakdown.differentials
                    .explanation}
            </p>

            {#if feedback.feedback_result.scoreBreakdown.differentials.educationalTip}
                <div class="bg-blue-50 p-4 rounded-md mt-4">
                    <div class="flex gap-3">
                        <Info
                            class="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <span
                                class="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1"
                                >Learning Point</span
                            >
                            <p class="text-sm text-blue-800">
                                {feedback.feedback_result.scoreBreakdown
                                    .differentials.educationalTip}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Meta information
    <div class="text-xs text-slate-500 mt-8 pt-4 border-t border-slate-200">
        <p>
            Generated using {feedback.metadata.model_version} in {feedback.metadata.processing_time_seconds.toFixed(
                2,
            )}s
        </p>
    </div> -->
</div>
