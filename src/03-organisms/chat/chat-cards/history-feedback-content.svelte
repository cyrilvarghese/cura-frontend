<script lang="ts">
    import type { HistoryFeedbackResponse } from "$lib/services/feedbackService";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { onMount } from "svelte";
    import { scale, fade, fly } from "svelte/transition";
    import { Button } from "$lib/components/ui/button";
    import { CheckCircle, XCircle, AlertCircle } from "lucide-svelte";

    export let feedback: HistoryFeedbackResponse;

    let showScore = false;

    onMount(() => {
        setTimeout(() => {
            showScore = true;
        }, 500);
    });

    // Function to get score color class
    function getScoreColorClass(score: number) {
        if (score >= 8) return "bg-emerald-500 text-white";
        if (score >= 6) return "bg-green-500 text-white";
        if (score >= 4) return "bg-yellow-500 text-white";
        if (score >= 2) return "bg-orange-500 text-white";
        return "bg-red-500 text-white";
    }

    // Function to get relevance badge class
    function getRelevanceBadgeClass(relevance: string) {
        if (relevance === "relevant")
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }

    // Function to get relevance icon
    function getRelevanceIcon(relevance: string) {
        if (relevance === "relevant") return CheckCircle;
        return XCircle;
    }
</script>

<div class="p-4 pl-0 space-y-8">
    <!-- Score Summary -->
    <div class="bg-blue-50 p-6 rounded-xl shadow-sm">
        <div class="flex flex-col md:flex-row items-center gap-6">
            {#if showScore}
                <div
                    in:scale={{ duration: 700, start: 0.5 }}
                    class="relative shrink-0"
                >
                    <div
                        class={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreColorClass(feedback.analysis_result.summary_feedback.cumulative_score)}`}
                    >
                        {feedback.analysis_result.summary_feedback.cumulative_score.toFixed(
                            1,
                        )}
                    </div>
                    <div
                        class="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                </div>
            {/if}

            <div
                in:fade={{ delay: 300, duration: 500 }}
                class="flex-1 space-y-3"
            >
                <h2
                    class="text-xl font-semibold text-gray-800 text-center md:text-left"
                >
                    Overall Assessment
                </h2>
                <p class="text-gray-700 max-w-2xl text-center md:text-left">
                    {feedback.analysis_result.summary_feedback.score_reason}
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 class="font-medium text-green-700 mb-2 flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    Key Strength
                </h3>
                <p class="text-sm text-gray-700">
                    {feedback.analysis_result.summary_feedback.key_strength}
                </p>
            </div>

            <div class="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 class="font-medium text-red-700 mb-2 flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    Key Weakness
                </h3>
                <p class="text-sm text-gray-700">
                    {feedback.analysis_result.summary_feedback.key_weakness}
                </p>
            </div>
        </div>
    </div>

    <!-- Questions Asked Evaluation -->
    {#if feedback.analysis_result.student_question_evaluation && feedback.analysis_result.student_question_evaluation.length > 0}
        <div
            class="bg-white p-5 rounded-lg shadow-sm border-l-2 border-blue-200"
        >
            <h3 class="text-lg font-semibold mb-4 text-blue-600">
                Questions You Asked
            </h3>
            <ul class="divide-y divide-gray-100">
                {#each feedback.analysis_result.student_question_evaluation as item, i}
                    <li
                        in:fly={{ y: 20, delay: i * 50, duration: 300 }}
                        class="flex items-start group py-3 first:pt-0 last:pb-0"
                    >
                        <span
                            class="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mt-0.5"
                        >
                            {i + 1}
                        </span>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-gray-700 font-medium"
                                    >"{item.question_asked}"</span
                                >
                                <span
                                    class={`text-xs px-2 py-0.5 rounded-full ${getRelevanceBadgeClass(item.relevance_grade)}`}
                                >
                                    <svelte:component
                                        this={getRelevanceIcon(
                                            item.relevance_grade,
                                        )}
                                        class="inline-block h-3 w-3 mr-1"
                                    />
                                    {item.relevance_grade}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">{item.reason}</p>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <!-- Critical Missed Areas -->
    <div class="space-y-4">
        <h3 class="font-semibold text-lg flex items-center text-gray-800">
            <AlertCircle class="h-5 w-5 mr-2 text-red-500" />
            Critical Missed Areas
        </h3>

        <div class="grid grid-cols-1 gap-4">
            {#each feedback.analysis_result.critical_missed_areas as item, i}
                <div
                    in:fade={{ delay: 100 * i, duration: 400 }}
                    class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                    <div class="bg-red-50 px-4 py-3 border-b border-red-100">
                        <h4 class="font-medium text-red-800 capitalize">
                            {item.domain.replace(/_/g, " ")}
                        </h4>
                    </div>
                    <div class="p-4 space-y-3">
                        <div>
                            <span class="text-sm font-medium text-gray-500"
                                >Why it's important:</span
                            >
                            <p class="text-gray-700">
                                {item.importance_reason}
                            </p>
                        </div>
                        <div
                            class="bg-blue-50 p-3 rounded-md border border-blue-100"
                        >
                            <span class="text-sm font-medium text-blue-700"
                                >Example question you could have asked:</span
                            >
                            <p class="text-gray-700 italic mt-1">
                                "{item.example_missed_question}"
                            </p>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Metadata -->
</div>
