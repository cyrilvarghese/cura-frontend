<script lang="ts">
    import type { DiagnosisContextResponse } from "$lib/services/diagnosisContextService";
    import { Button } from "$lib/components/ui/button";
    import {
        AlertCircle,
        Stethoscope,
        Lightbulb,
        List,
        CheckCircle,
        FileText,
        XCircle,
        ClipboardCheck,
        Activity,
        Microscope,
        Info,
        MessageCircle,
    } from "lucide-svelte";

    export let diagnosisContext: DiagnosisContextResponse;
</script>

<div class="space-y-8 max-w-4xl mx-auto">
    <h2
        class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center gap-2"
    >
        <ClipboardCheck class="h-6 w-6 text-primary" />
        Diagnosis Context
    </h2>

    <!-- Primary Diagnosis -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-4 border-blue-200"
    >
        <h3
            class="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-300 flex items-center gap-2"
        >
            <CheckCircle class="h-5 w-5" />
            Primary Diagnosis
        </h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
            {diagnosisContext.content.primaryDiagnosis}
        </p>
    </div>

    <!-- Key Evidence -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-green-200"
    >
        <h3
            class="text-lg font-semibold mb-3 text-green-600 dark:text-green-300 flex items-center gap-2"
        >
            <Lightbulb class="h-5 w-5" />
            Key Evidence
        </h3>
        <ul class="space-y-2">
            {#each diagnosisContext.content.keyEvidence as evidence}
                <li class="flex items-start">
                    <span
                        class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-green-100 dark:bg-green-900/50"
                    ></span>
                    <span class="text-gray-700 dark:text-gray-300"
                        >{evidence}</span
                    >
                </li>
            {/each}
        </ul>
    </div>

    <!-- Essential Physical Exams -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-amber-200"
    >
        <h3
            class="text-lg font-semibold mb-3 text-amber-600 dark:text-amber-300 flex items-center gap-2"
        >
            <Stethoscope class="h-5 w-5" />
            Essential Physical Exams
        </h3>
        <div class="space-y-4">
            {#each diagnosisContext.content.essentialPhysicalExams as exam}
                <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <h4
                        class="font-semibold text-amber-700 dark:text-amber-300"
                    >
                        {exam.name}
                    </h4>
                    <div class="mt-2 space-y-2">
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            <span
                                class="font-medium text-gray-700 dark:text-gray-200"
                                >Purpose:</span
                            >
                            {exam.purpose}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            <span
                                class="font-medium text-gray-700 dark:text-gray-200"
                                >Description:</span
                            >
                            {exam.generalDescription}
                        </p>
                        {#if exam.educationalTip}
                            <div
                                class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                            >
                                <MessageCircle
                                    class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                />
                                <p
                                    class="text-xs text-blue-700 dark:text-blue-300"
                                >
                                    {exam.educationalTip}
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Key Diagnostic Tests -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-indigo-200"
    >
        <h3
            class="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-300 flex items-center gap-2"
        >
            <Microscope class="h-5 w-5" />
            Key Diagnostic Tests
        </h3>
        <div class="space-y-4">
            {#each diagnosisContext.content.keyDiagnosticTests as test}
                <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <h4
                        class="font-semibold text-indigo-700 dark:text-indigo-300"
                    >
                        {test.name}
                    </h4>
                    <div class="mt-2 space-y-2">
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            <span
                                class="font-medium text-gray-700 dark:text-gray-200"
                                >Purpose:</span
                            >
                            {test.purpose}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            <span
                                class="font-medium text-gray-700 dark:text-gray-200"
                                >Description:</span
                            >
                            {test.generalDescription}
                        </p>
                        {#if test.educationalTip}
                            <div
                                class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                            >
                                <MessageCircle
                                    class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                />
                                <p
                                    class="text-xs text-blue-700 dark:text-blue-300"
                                >
                                    {test.educationalTip}
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- NEW FORMAT: Plausible Differential Diagnoses -->
    {#if diagnosisContext.content.plausibleDifferentials && diagnosisContext.content.plausibleDifferentials.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-purple-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-300 flex items-center gap-2"
            >
                <CheckCircle class="h-5 w-5" />
                Plausible Differential Diagnoses
            </h3>
            <div class="space-y-4">
                {#each diagnosisContext.content.plausibleDifferentials as differential, i}
                    <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span
                                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                            >
                                {i + 1}
                            </span>
                            <span
                                class="font-semibold text-gray-800 dark:text-gray-200"
                            >
                                {differential.name}
                            </span>
                        </div>
                        <div class="pl-8 space-y-2">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                <span class="font-medium">History Clues:</span>
                                {differential.differentiatingHistoryClues}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                <span class="font-medium">Exam Findings:</span>
                                {differential.differentiatingExamFindings}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                <span class="font-medium">Test Results:</span>
                                {differential.differentiatingTestResults}
                            </p>
                            {#if differential.educationalTip}
                                <div
                                    class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                                >
                                    <MessageCircle
                                        class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                    />
                                    <p
                                        class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                        {differential.educationalTip}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- NEW FORMAT: Ruled Out Differential Diagnoses -->
    {#if diagnosisContext.content.ruledOutDifferentials && diagnosisContext.content.ruledOutDifferentials.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-red-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-red-600 dark:text-red-300 flex items-center gap-2"
            >
                <XCircle class="h-5 w-5" />
                Ruled Out Differential Diagnoses
            </h3>
            <div class="space-y-4">
                {#each diagnosisContext.content.ruledOutDifferentials as differential, i}
                    <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span
                                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium"
                            >
                                {i + 1}
                            </span>
                            <span
                                class="font-semibold text-gray-800 dark:text-gray-200"
                            >
                                {differential.name}
                            </span>
                        </div>
                        <div class="pl-8">
                            <p
                                class="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                            >
                                <XCircle
                                    class="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                                />
                                <span>{differential.reasonForExclusion}</span>
                            </p>
                            {#if differential.educationalTip}
                                <div
                                    class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                                >
                                    <MessageCircle
                                        class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                    />
                                    <p
                                        class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                        {differential.educationalTip}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- OLD FORMAT: Correct Differential Diagnoses -->
    {#if (!diagnosisContext.content.plausibleDifferentials || diagnosisContext.content.plausibleDifferentials.length === 0) && diagnosisContext.content.keyCorrectDifferentials && diagnosisContext.content.keyCorrectDifferentials.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-purple-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-300 flex items-center gap-2"
            >
                <List class="h-5 w-5" />
                Correct Differential Diagnoses
            </h3>
            <div class="space-y-4">
                {#each diagnosisContext.content.keyCorrectDifferentials as differential, i}
                    <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span
                                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                            >
                                {i + 1}
                            </span>
                            <span
                                class="font-semibold text-gray-800 dark:text-gray-200"
                            >
                                {differential.name}
                            </span>
                        </div>
                        <div class="pl-8">
                            <p
                                class="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                            >
                                <CheckCircle
                                    class="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5"
                                />
                                <span>{differential.primaryDifferentiator}</span
                                >
                            </p>
                            {#if differential.educationalTip}
                                <div
                                    class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                                >
                                    <MessageCircle
                                        class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                    />
                                    <p
                                        class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                        {differential.educationalTip}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- OLD FORMAT: Incorrect Differential Diagnoses -->
    {#if (!diagnosisContext.content.ruledOutDifferentials || diagnosisContext.content.ruledOutDifferentials.length === 0) && diagnosisContext.content.keyIncorrectDifferentials && diagnosisContext.content.keyIncorrectDifferentials.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-red-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-red-600 dark:text-red-300 flex items-center gap-2"
            >
                <XCircle class="h-5 w-5" />
                Incorrect Differential Diagnoses
            </h3>
            <div class="space-y-4">
                {#each diagnosisContext.content.keyIncorrectDifferentials as differential, i}
                    <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span
                                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium"
                            >
                                {i + 1}
                            </span>
                            <span
                                class="font-semibold text-gray-800 dark:text-gray-200"
                            >
                                {differential.name}
                            </span>
                        </div>
                        <div class="pl-8">
                            <p
                                class="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                            >
                                <XCircle
                                    class="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                                />
                                <span>{differential.primaryDifferentiator}</span
                                >
                            </p>
                            {#if differential.educationalTip}
                                <div
                                    class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                                >
                                    <MessageCircle
                                        class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                    />
                                    <p
                                        class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                        {differential.educationalTip}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- LEGACY FORMAT: Differential Diagnoses -->
    {#if !diagnosisContext.content.plausibleDifferentials && !diagnosisContext.content.ruledOutDifferentials && !diagnosisContext.content.keyCorrectDifferentials && !diagnosisContext.content.keyIncorrectDifferentials && diagnosisContext.content.keyDifferentials && diagnosisContext.content.keyDifferentials.length > 0}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-purple-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-300 flex items-center gap-2"
            >
                <List class="h-5 w-5" />
                Differential Diagnoses
            </h3>
            <div class="space-y-4">
                {#each diagnosisContext.content.keyDifferentials as differential, i}
                    <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div class="flex items-center gap-2 mb-2">
                            <span
                                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                            >
                                {i + 1}
                            </span>
                            <span
                                class="font-semibold text-gray-800 dark:text-gray-200"
                            >
                                {differential.name}
                            </span>
                        </div>
                        <div class="pl-8">
                            <p
                                class="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                            >
                                <XCircle
                                    class="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                                />
                                <span>{differential.primaryDifferentiator}</span
                                >
                            </p>
                            {#if differential.educationalTip}
                                <div
                                    class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2"
                                >
                                    <MessageCircle
                                        class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                                    />
                                    <p
                                        class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                        {differential.educationalTip}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
