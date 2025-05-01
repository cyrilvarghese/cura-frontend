<script lang="ts">
    import type { HistoryContextResponse } from "$lib/services/historyContextService";
    import { Button } from "$lib/components/ui/button";
    import { Edit, MoreVertical, Pencil, PlusCircle } from "lucide-svelte";

    export let historyContext: HistoryContextResponse;

    function hasAssociatedSymptoms(symptoms: any): boolean {
        if (!symptoms) return false;
        if (Array.isArray(symptoms)) return symptoms.length > 0;
        return Object.keys(symptoms).length > 0;
    }
</script>

<div class="space-y-8 max-w-4xl mx-auto">
    <h2
        class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700"
    >
        History Summary
    </h2>

    <!-- Chief Complaint -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-4 border-blue-200"
    >
        <h3 class="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-300">
            Chief Complaint
        </h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
            {historyContext.content.case_summary_history.chief_complaint ||
                "No chief complaint recorded"}
        </p>
    </div>

    <!-- History of Present Illness -->
    {#if historyContext.content.case_summary_history.history_of_present_illness}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-4 border-orange-200"
        >
            <h3
                class="text-lg font-semibold mb-2 text-orange-600 dark:text-orange-300"
            >
                History of Present Illness
            </h3>
            <p class="text-gray-700 dark:text-gray-300 text-lg">
                {historyContext.content.case_summary_history
                    .history_of_present_illness}
            </p>
        </div>
    {/if}

    {#if historyContext.content.case_summary_history.demographics_risk && (historyContext.content.case_summary_history.demographics_risk.risk_factors !== undefined || historyContext.content.case_summary_history.demographics_risk.age !== undefined)}
        <!-- Demographics & Risk Factors -->
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-purple-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-300"
            >
                Demographics & Risk Factors
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <p class="flex items-center">
                        <span
                            class="font-medium w-40 text-gray-600 dark:text-gray-400"
                            >Age:</span
                        >
                        <span class="text-gray-800 dark:text-gray-200"
                            >{historyContext.content.case_summary_history
                                .demographics_risk.age}</span
                        >
                    </p>
                    <p class="flex items-center">
                        <span
                            class="font-medium w-40 text-gray-600 dark:text-gray-400"
                            >Gender:</span
                        >
                        <span class="text-gray-800 dark:text-gray-200"
                            >{historyContext.content.case_summary_history
                                .demographics_risk.gender}</span
                        >
                    </p>
                    <p class="flex items-center">
                        <span
                            class="font-medium w-40 text-gray-600 dark:text-gray-400"
                            >Sexual Orientation:</span
                        >
                        <span class="text-gray-800 dark:text-gray-200"
                            >{historyContext.content.case_summary_history
                                .demographics_risk.sexual_orientation}</span
                        >
                    </p>
                </div>
                <div
                    class="bg-purple-50/70 dark:bg-purple-900/10 p-3 rounded-md"
                >
                    <p class="flex items-start">
                        <span
                            class="font-medium text-gray-600 dark:text-gray-400 mr-2"
                            >Risk Factors:</span
                        >
                        <span class="text-gray-800 dark:text-gray-200"
                            >{historyContext.content.case_summary_history
                                .demographics_risk.risk_factors}</span
                        >
                    </p>
                </div>
            </div>
        </div>
    {/if}
    <!-- History Timeline -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-green-200"
    >
        <h3
            class="text-lg font-semibold mb-4 text-green-600 dark:text-green-300"
        >
            History Timeline
        </h3>
        <div
            class="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-green-100 dark:before:bg-green-900/50"
        >
            {#each Object.entries(historyContext.content.case_summary_history.history_timeline || {}) as [timepoint, event], i}
                <div class="relative">
                    <div
                        class="absolute left-[-28px] top-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white dark:border-gray-800 shadow"
                    ></div>
                    <div
                        class="mb-1 font-semibold text-green-600 dark:text-green-300"
                    >
                        {timepoint.replace(/_/g, " ")}
                    </div>
                    <div class="text-gray-700 dark:text-gray-300">{event}</div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Symptoms and Findings -->
    {#if hasAssociatedSymptoms(historyContext.content.case_summary_history.associated_symptoms)}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Associated Symptoms -->
            <div
                class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-amber-200"
            >
                <h3
                    class="text-lg font-semibold mb-3 text-amber-600 dark:text-amber-300"
                >
                    Associated Symptoms
                </h3>
                <ul class="space-y-2">
                    {#if Array.isArray(historyContext.content.case_summary_history.associated_symptoms)}
                        {#each historyContext.content.case_summary_history.associated_symptoms as symptom}
                            <li class="flex items-start">
                                <span
                                    class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-amber-100 dark:bg-amber-900/50"
                                ></span>
                                <span class="text-gray-700 dark:text-gray-300"
                                    >{symptom}</span
                                >
                            </li>
                        {/each}
                    {:else}
                        {#each Object.entries(historyContext.content.case_summary_history.associated_symptoms) as [key, value]}
                            <li class="flex items-start">
                                <span
                                    class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-amber-100 dark:bg-amber-900/50"
                                ></span>
                                <span class="text-gray-700 dark:text-gray-300">
                                    <span class="font-medium"
                                        >{key.replace(/_/g, " ")}:</span
                                    >
                                    {value}
                                </span>
                            </li>
                        {/each}
                    {/if}
                </ul>
            </div>

            <!-- Pertinent Positives -->
            {#if historyContext.content.case_summary_history.pertinent_positives && historyContext.content.case_summary_history.pertinent_positives.length > 0}
                <div
                    class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-red-200"
                >
                    <h3
                        class="text-lg font-semibold mb-3 text-red-600 dark:text-red-300"
                    >
                        Pertinent Positives
                    </h3>
                    <ul class="space-y-2">
                        {#each historyContext.content.case_summary_history.pertinent_positives as positive}
                            <li class="flex items-start">
                                <span
                                    class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-red-100 dark:bg-red-900/50"
                                ></span>
                                <span class="text-gray-700 dark:text-gray-300"
                                    >{positive}</span
                                >
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/if}
    <!-- Pertinent Negatives -->
    {#if historyContext.content.case_summary_history.pertinent_negatives_from_history.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-indigo-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-300"
            >
                Pertinent Negatives
            </h3>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {#each historyContext.content.case_summary_history.pertinent_negatives_from_history as negative}
                    <li class="flex items-start">
                        <span
                            class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50"
                        ></span>
                        <span class="text-gray-700 dark:text-gray-300"
                            >{negative}</span
                        >
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <!-- Past Medical History -->
    {#if historyContext.content.case_summary_history.past_medical_history}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-pink-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-pink-600 dark:text-pink-300"
            >
                Past Medical History
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
                {historyContext.content.case_summary_history
                    .past_medical_history}
            </p>
        </div>
    {/if}

    <!-- Family History -->
    {#if historyContext.content.case_summary_history.family_history}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-yellow-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-300"
            >
                Family History
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
                {historyContext.content.case_summary_history.family_history}
            </p>
        </div>
    {/if}

    <!-- Medications & Allergies -->
    {#if historyContext.content.case_summary_history.medications_allergies}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-rose-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-rose-600 dark:text-rose-300"
            >
                Medications & Allergies
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
                {historyContext.content.case_summary_history
                    .medications_allergies}
            </p>
        </div>
    {/if}

    <!-- Social History -->
    {#if historyContext.content.case_summary_history.social_history}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-cyan-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-cyan-600 dark:text-cyan-300"
            >
                Social History
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
                {historyContext.content.case_summary_history.social_history}
            </p>
        </div>
    {/if}

    <!-- Expected Questions -->
    {#if historyContext.content.expected_questions_with_domains && historyContext.content.expected_questions_with_domains.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-2 border-teal-200"
        >
            <div class="flex justify-between items-center mb-3">
                <h3
                    class="text-lg font-semibold text-teal-600 dark:text-teal-300"
                >
                    Expected Questions
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    class="text-xs gap-1 cursor-pointer"
                >
                    <PlusCircle class="h-3.5 w-3.5" />
                    Add Question
                </Button>
            </div>
            <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                {#each historyContext.content.expected_questions_with_domains as { question, domain }, i}
                    <li
                        class="flex items-center group py-2.5 first:pt-0 last:pb-0"
                    >
                        <span
                            class="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300 text-xs font-medium"
                            >{i + 1}</span
                        >
                        <div class="flex-1">
                            <span class="text-gray-700 dark:text-gray-300"
                                >{question}</span
                            >
                            <span
                                class="ml-2 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full"
                            >
                                {domain.replace(/_/g, " ")}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil class="text-blue-500 h-4 w-4" />
                        </Button>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
