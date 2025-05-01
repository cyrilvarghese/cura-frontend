<script lang="ts">
    import type { ClinicalFindingsContextResponse } from "$lib/services/clinicalFindingsService";
    import { Button } from "$lib/components/ui/button";
    import {
        AlertTriangle,
        Microscope,
        FileText,
        AlertCircle,
        PlusCircle,
        Pencil,
        ListIcon,
        Hospital,
    } from "lucide-svelte";

    export let clinicalFindingsContext: ClinicalFindingsContextResponse;
</script>

<div class="space-y-8 max-w-4xl mx-auto">
    <h2
        class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center gap-2"
    >
        <Hospital class="w-6 h-6 mr-2" />
        Clinical Findings
    </h2>

    <!-- Critical Findings -->
    <div
        class="bg-white dark:bg-gray-800 p-5 rounded-sm shadow-md border-l-4 border-red-400"
    >
        <ul class="space-y-6">
            {#each clinicalFindingsContext.content.critical_findings_with_relevance as { finding, relevance }}
                <li class="flex flex-col">
                    <div class="flex items-start">
                        <span
                            class="inline-block w-2 h-2 mt-2 mr-2 rounded-full bg-red-500 dark:bg-red-400"
                        ></span>
                        <span
                            class="text-gray-800 dark:text-gray-200 font-medium"
                            >{finding}</span
                        >
                    </div>
                    <div class="ml-4 mt-1">
                        <span
                            class="text-sm text-gray-600 dark:text-gray-400 italic"
                            >{relevance}</span
                        >
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>
