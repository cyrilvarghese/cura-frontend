<script lang="ts">
    import type { StudentPerformanceData } from "$lib/services/studentPerformanceService";

    interface Props {
        performanceData: StudentPerformanceData[];
    }

    const { performanceData }: Props = $props();

    // Define categories for the heatmap
    const categories = [
        { key: "history", label: "History" },
        { key: "physicals", label: "Physical" },
        { key: "tests", label: "Tests" },
        { key: "diagnosis", label: "Diagnosis" },
        { key: "reasoning", label: "Reasoning" },
        { key: "differentials", label: "Differentials" },
    ];

    // Function to get color class based on score
    function getScoreColorClass(score: number): string {
        if (score <= 2.0) return "bg-gradient-to-br from-red-500 to-red-600"; // Dark red gradient
        if (score <= 2.4) return "bg-gradient-to-br from-red-400 to-red-500"; // Medium red gradient
        if (score <= 2.9)
            return "bg-gradient-to-br from-orange-400 to-orange-500"; // Orange gradient
        if (score <= 3.4)
            return "bg-gradient-to-br from-yellow-400 to-yellow-500"; // Yellow gradient
        if (score <= 3.9)
            return "bg-gradient-to-br from-green-400 to-green-500"; // Light green gradient
        return "bg-gradient-to-br from-green-500 to-green-600"; // Dark green gradient
    }

    // Function to get text color for readability
    function getTextColorClass(score: number): string {
        if (score <= 2.9) return "text-white";
        return "text-white";
    }

    // Prepare data for display (limit to first 6 cases for better display)
    const displayData = $derived(
        performanceData.slice(0, 6).map((item, index) => ({
            ...item,
            displayIndex: index + 1,
            shortDiagnosis:
                item.primary_diagnosis.length > 20
                    ? item.primary_diagnosis.substring(0, 20) + "..."
                    : item.primary_diagnosis,
        })),
    );
</script>

<div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Performance Heatmap - Skills vs Cases
        </h2>
        <p class="text-gray-600 text-sm">
            Visual representation of your performance across different clinical
            skills and cases
        </p>
    </div>

    {#if displayData.length > 0}
        <div class="overflow-x-auto">
            <!-- Header Row -->
            <div class="grid grid-cols-7 gap-4 mb-4">
                <div class="text-center"></div>
                <!-- Empty cell for row labels -->
                {#each categories as category}
                    <div class="text-center">
                        <h3 class="font-semibold text-gray-700 text-sm">
                            {category.label}
                        </h3>
                    </div>
                {/each}
            </div>

            <!-- Data Rows -->
            {#each displayData as caseData}
                <div class="grid grid-cols-7 gap-4 mb-3">
                    <!-- Case Label -->
                    <div class="flex flex-col justify-center pr-4">
                        <div class="text-right">
                            <p class="font-medium text-gray-800 text-sm">
                                Case {caseData.displayIndex}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">
                                {caseData.shortDiagnosis}
                            </p>
                        </div>
                    </div>

                    <!-- Score Cells -->
                    {#each categories as category}
                        {@const score = (caseData as any)[
                            `student_${category.key}`
                        ] as number}
                        <div
                            class="flex items-center justify-center h-16 w-24 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer {getScoreColorClass(
                                score,
                            )}"
                            title="{category.label}: {score}/4.0 for {caseData.primary_diagnosis}"
                        >
                            <span
                                class="text-lg font-bold {getTextColorClass(
                                    score,
                                )}"
                            >
                                {score}
                            </span>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>

        <!-- Legend -->
        <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="flex items-center justify-center">
                <span class="text-sm font-medium text-gray-700 mr-4"
                    >Performance Scale:</span
                >
                <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">≤2.0</span>
                    </div>
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-red-400 to-red-500 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">2.0-2.4</span>
                    </div>
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">2.5-2.9</span>
                    </div>
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">3.0-3.4</span>
                    </div>
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">3.5-3.9</span>
                    </div>
                    <div class="flex items-center">
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded mr-2"
                        ></div>
                        <span class="text-xs text-gray-600">4.0</span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="text-center py-8">
            <p class="text-gray-500">
                No performance data available for heatmap visualization.
            </p>
        </div>
    {/if}
</div>
