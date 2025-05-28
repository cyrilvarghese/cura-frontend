<script lang="ts">
    import type { PrimaryDiagnosisFeedback } from "$lib/services/primaryDiagnosisFeedbackService";
    import {
        ClipboardList,
        Stethoscope,
        FileText,
        Microscope,
        Clock,
        FlaskConical,
        ListTree,
    } from "lucide-svelte";

    export let primaryDiagnosisFeedback: PrimaryDiagnosisFeedback;

    // Track which step's rationale is open
    let openStep: number | null = null;

    function getIconForType(type: string) {
        switch (type) {
            case "HistoryTaking - Broad":
            case "HistoryTaking - Focused":
                return ClipboardList;
            case "PhysicalExam":
            case "PhysicalExam Specific":
                return Stethoscope;
            case "InitialLabTest":
            case "ConfirmatoryLabTest":
                return FlaskConical;
            case "DifferentialConsideration":
                return ListTree;
            default:
                return ClipboardList;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case "HistoryTaking - Broad":
            case "HistoryTaking - Focused":
                return "blue";
            case "PhysicalExam":
                return "green";
            case "InitialLabTest":
            case "ConfirmatoryLabTest":
                return "purple";
            case "DifferentialConsideration":
                return "amber";
            default:
                return "gray";
        }
    }
</script>

<!-- OUTER CONTAINER: now just a timeline, no card -->
<div
    class="relative pl-8 space-y-0 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700 p-5 bg-white dark:bg-gray-900"
>
    <!-- Timeline Title aligned with step number -->
    <div class="flex items-center mb-4" style="margin-left: -50px;">
        <div class="w-5 h-5 flex items-center justify-center"></div>
        <Clock
            class="w-6 h-6 mr-4 text-gray-700 dark:text-white z-10 bg-white rounded-full"
        />
        <h3 class="text-xl font-semibold text-gray-700 dark:text-white m-0">
            Suggested Diagnostic Timeline
        </h3>
    </div>
    {#each primaryDiagnosisFeedback.primaryDxFeedback.idealDiagnosticTimeline as step, i (step.stepNumber)}
        <div class="relative flex">
            <!-- Step number circle -->
            <div
                class="absolute left-[-30px] top-[-2px] w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-200 dark:border-gray-700 shadow flex items-center justify-center text-white font-bold text-[10px] z-10"
            >
                {step.stepNumber}
            </div>
            <!-- Step content -->
            <div class="flex-1 pl-2 pb-6">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <!-- Icon for step type -->
                    {#if getIconForType(step.type)}
                        {@const Icon = getIconForType(step.type)}
                        <Icon class="w-4 h-4 text-blue-500" />
                    {/if}
                    <!-- Step name as a tag/pill -->
                    <span
                        class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-gray-800 text-gray-800 dark:text-white dark:border-gray-700 font-medium cursor-pointer hover:underline"
                        on:click={() =>
                            (openStep =
                                openStep === step.stepNumber
                                    ? null
                                    : step.stepNumber)}
                    >
                        {step.type.replace(/-/g, " ")}
                    </span>
                    {#each step.rationaleTags as tag}
                        <span class="font-medium text-black dark:text-white">
                            {tag},
                        </span>
                    {/each}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    {step.actionDescription}
                </div>
                {#if openStep === step.stepNumber}
                    <div
                        class="text-sm text-gray-600 dark:text-gray-400 italic"
                    >
                        {step.detailedRationale}
                    </div>
                {/if}
            </div>
            <!-- Arrow SVG, except after last step -->
            {#if i < primaryDiagnosisFeedback.primaryDxFeedback.idealDiagnosticTimeline.length - 1}
                <svg
                    class="absolute left-[-34.5px] top-[20px] w-8 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2v20m0 0l-4-4m4 4l4-4" />
                </svg>
            {/if}
        </div>
    {/each}
</div>
