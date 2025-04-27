<script lang="ts">
    import type { ClinicalFindingsContextResponse } from "$lib/types/caseTypes";
    import { Button } from "$lib/components/ui/button";
    import {
        AlertTriangle,
        Microscope,
        FileText,
        AlertCircle,
        PlusCircle,
        Pencil,
    } from "lucide-svelte";

    export let clinicalFindingsContext: ClinicalFindingsContextResponse;
</script>

<div class="space-y-8 max-w-4xl mx-auto">
    <h2
        class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700"
    >
        Clinical Findings
    </h2>

    <!-- Critical Findings -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-4 border-red-400"
    >
        <ul class="space-y-2">
            {#each clinicalFindingsContext.content.critical_findings as finding}
                <li class="flex items-start">
                    <span
                        class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-red-100 dark:bg-red-900/50"
                    ></span>
                    <span class="text-gray-700 dark:text-gray-300"
                        >{finding}</span
                    >
                </li>
            {/each}
        </ul>
    </div>

    <!-- Additional Observations (This is a placeholder section - you'd need to modify your data structure to include these fields) -->
    {#if clinicalFindingsContext.content.additional_observations}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-blue-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-300 flex items-center gap-2"
            >
                <Microscope class="h-5 w-5" />
                Additional Observations
            </h3>
            <ul class="space-y-2">
                {#each clinicalFindingsContext.content.additional_observations as observation}
                    <li class="flex items-start">
                        <span
                            class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-blue-100 dark:bg-blue-900/50"
                        ></span>
                        <span class="text-gray-700 dark:text-gray-300"
                            >{observation}</span
                        >
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <!-- Recommended Actions (This is a placeholder section - you'd need to modify your data structure to include these fields) -->
    {#if clinicalFindingsContext.content.recommended_actions}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-green-200"
        >
            <div class="flex justify-between items-center mb-3">
                <h3
                    class="text-lg font-semibold text-green-600 dark:text-green-300 flex items-center gap-2"
                >
                    <FileText class="h-5 w-5" />
                    Recommended Actions
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    class="text-xs gap-1 cursor-pointer"
                >
                    <PlusCircle class="h-3.5 w-3.5" />
                    Add Action
                </Button>
            </div>
            <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                {#each clinicalFindingsContext.content.recommended_actions as action, i}
                    <li
                        class="flex items-center group py-2.5 first:pt-0 last:pb-0"
                    >
                        <span
                            class="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 text-xs font-medium"
                            >{i + 1}</span
                        >
                        <span class="text-gray-700 dark:text-gray-300"
                            >{action}</span
                        >
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

    <!-- Clinical Significance (This is a placeholder section - you'd need to modify your data structure to include these fields) -->
    {#if clinicalFindingsContext.content.clinical_significance}
        <div
            class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-2 border-purple-200"
        >
            <h3
                class="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-300 flex items-center gap-2"
            >
                <AlertCircle class="h-5 w-5" />
                Clinical Significance
            </h3>
            <p class="text-gray-700 dark:text-gray-300">
                {clinicalFindingsContext.content.clinical_significance}
            </p>
        </div>
    {/if}
</div>
