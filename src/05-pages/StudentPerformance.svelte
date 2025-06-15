<script lang="ts">
    import { onMount } from "svelte";
    import PageLayout from "../04-templates/page-layout.svelte";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import { studentPerformanceStore } from "$lib/stores/studentPerformanceStore";
    import { studentPerformanceService } from "$lib/services/studentPerformanceService";
    import PerformanceHeatmap from "$lib/components/PerformanceHeatmap.svelte";
    import type { StudentPerformanceData } from "$lib/services/studentPerformanceService";

    // Define Category interface
    interface Category {
        key: string;
        label: string;
    }

    // Define categories for student performance
    const categories: Category[] = [
        { key: "differentials", label: "Differential Diagnoses" },
        { key: "history", label: "History Taking" },
        { key: "physicals", label: "Physical Examination" },
        { key: "tests", label: "Lab Tests" },
        { key: "diagnosis", label: "Diagnosis" },
        { key: "reasoning", label: "Clinical Reasoning" },
    ];

    // Subscribe to the student performance store
    let performanceData: StudentPerformanceData[] = [];
    let isLoading = false;
    let error: string | null = null;

    // View toggle states
    let isHeatmapView = false;
    let useMockData = false;

    // Store unsubscribe function
    const unsubscribe = studentPerformanceStore.subscribe((state) => {
        performanceData = state.performanceData || [];
        isLoading = state.isLoading;
        error = state.error;
    });

    // Fetch data on component mount
    onMount(() => {
        // Set initial data source
        studentPerformanceService.setUseMockData(useMockData);
        studentPerformanceStore.getPerformanceComparison();

        // Return the unsubscribe function directly, not as a Promise
        return unsubscribe;
    });

    // Handle data source toggle
    function handleDataSourceToggle() {
        useMockData = !useMockData;
        studentPerformanceService.setUseMockData(useMockData);
        studentPerformanceStore.getPerformanceComparison();
    }

    // Handle view toggle
    function handleViewToggle() {
        isHeatmapView = !isHeatmapView;
    }

    // Calculate total scores for each case
    $: totalScores = performanceData.map((caseData) => {
        let studentTotal = 0;
        let avgTotal = 0;
        let maxTotal = 0;

        categories.forEach((category) => {
            studentTotal += caseData[`student_${category.key}`] as number;
            avgTotal += caseData[`avg_${category.key}`] as number;
            maxTotal += caseData[`max_${category.key}`] as number;
        });

        const percentOfAvg = Math.round((studentTotal / avgTotal) * 100);

        return { studentTotal, avgTotal, maxTotal, percentOfAvg };
    });

    // Function to get score color based on performance
    function getScoreColor(
        score: string | number,
        avg: number,
        max: number,
    ): string {
        const numScore =
            typeof score === "number" ? score : parseFloat(score as string);
        if (numScore >= avg) return "text-green-500";
        if (numScore >= avg * 0.8) return "text-yellow-500";
        return "text-red-500";
    }

    // Add function to get performance label
    function getPerformanceLabel(score: string | number, avg: number): string {
        const numScore =
            typeof score === "number" ? score : parseFloat(score as string);
        if (numScore >= avg) return "Above Average";
        if (numScore >= avg * 0.8) return "Near Average";
        return "Needs Improvement";
    }
</script>

<LoadingOverlay isVisible={isLoading} message="Loading performance data..." />

<PageLayout
    breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Student Performance" },
    ]}
>
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold">My Performance</h1>
            <p class="text-gray-500 text-sm">
                Compare your performance against your peers.
            </p>
        </div>
        <div class="flex items-center gap-4">
            <!-- Data Source Toggle -->
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700"
                    >Data Source:</span
                >
                <button
                    class="px-3 py-1 text-xs rounded-md border transition-colors {useMockData
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}"
                    onclick={handleDataSourceToggle}
                >
                    {useMockData ? "Mock Data" : "API Data"}
                </button>
            </div>
            <!-- View Toggle -->
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700">View:</span>
                <div
                    class="flex rounded-md border border-gray-200 overflow-hidden"
                >
                    <button
                        class="px-3 py-1 text-xs transition-colors {!isHeatmapView
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'}"
                        onclick={handleViewToggle}
                        disabled={isHeatmapView === false}
                    >
                        Table
                    </button>
                    <button
                        class="px-3 py-1 text-xs transition-colors {isHeatmapView
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'}"
                        onclick={handleViewToggle}
                        disabled={isHeatmapView === true}
                    >
                        Heatmap
                    </button>
                </div>
            </div>
        </div>
    </div>
    <hr class="border-gray-200" />
    {#if error}
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-red-500 text-center">
                <p>Error loading performance data: {error}</p>
                <button
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onclick={() =>
                        studentPerformanceStore.getPerformanceComparison()}
                >
                    Retry
                </button>
            </div>
        </div>
    {:else if performanceData.length === 0 && !isLoading}
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-600">
                No performance data available.
            </p>
        </div>
    {:else}
        <div class="mt-4">
            {#if isHeatmapView}
                <PerformanceHeatmap {performanceData} />
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b">
                                <th
                                    class="w-[300px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom"
                                >
                                    Case
                                </th>
                                {#each categories as category}
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom"
                                    >
                                        {category.label}
                                    </th>
                                {/each}
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom"
                                >
                                    Overall
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-bottom"
                                >
                                    OSCE Score
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each performanceData as caseData, i}
                                <tr class="hover:bg-gray-50">
                                    <td
                                        class="w-[300px] px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        <div
                                            class="truncate w-[250px] cursor-pointer"
                                            title={caseData.primary_diagnosis}
                                        >
                                            {caseData.primary_diagnosis}
                                        </div>
                                    </td>
                                    {#each categories as category}
                                        {@const studentScore = caseData[
                                            `student_${category.key}`
                                        ] as number}
                                        {@const avgScore = caseData[
                                            `avg_${category.key}`
                                        ] as number}
                                        {@const maxScore = caseData[
                                            `max_${category.key}`
                                        ] as number}
                                        {@const scoreColor = getScoreColor(
                                            studentScore,
                                            avgScore,
                                            maxScore,
                                        )}
                                        {@const performanceLabel =
                                            getPerformanceLabel(
                                                studentScore,
                                                avgScore,
                                            )}
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            <div
                                                class="flex items-center cursor-pointer"
                                                title={`${performanceLabel} (Average: ${avgScore.toFixed(1)})`}
                                            >
                                                <span
                                                    class={`${scoreColor} font-medium cursor-pointer hover:text-blue-500`}
                                                >
                                                    {studentScore}
                                                </span>
                                                <!-- <span
                                                class="text-gray-500 text-sm ml-1"
                                            >
                                                / {(
                                                    caseData[
                                                        `max_${category.key}`
                                                    ] as number
                                                ).toFixed(1)}
                                            </span> -->
                                            </div>
                                        </td>
                                    {/each}
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        <div
                                            class="flex items-center whitespace-nowrap"
                                        >
                                            <span
                                                class={totalScores[i]
                                                    .studentTotal >=
                                                totalScores[i].avgTotal
                                                    ? "text-green-500 font-medium cursor-pointer"
                                                    : totalScores[i]
                                                            .studentTotal >=
                                                        totalScores[i]
                                                            .avgTotal *
                                                            0.8
                                                      ? "text-yellow-500 font-medium cursor-pointer"
                                                      : "text-red-500 font-medium cursor-pointer"}
                                                title={`${totalScores[i].percentOfAvg}% of average score (Average: ${totalScores[i].avgTotal.toFixed(1)})`}
                                            >
                                                {totalScores[
                                                    i
                                                ].studentTotal.toFixed(1)}
                                            </span>
                                            <!-- <span
                                            class="text-gray-500 text-sm ml-1 whitespace-nowrap"
                                        >
                                            / {totalScores[i].maxTotal.toFixed(
                                                1,
                                            )}
                                        </span> -->
                                        </div>
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {#if caseData.osce_score_summary}
                                            <div class="flex flex-col">
                                                <span
                                                    class="font-medium text-blue-600"
                                                >
                                                    {caseData.osce_score_summary.overallPercentage.toFixed(
                                                        1,
                                                    )}%
                                                </span>
                                                <span
                                                    class="text-xs text-gray-500"
                                                >
                                                    {caseData.osce_score_summary
                                                        .totalPointsEarned} / {caseData
                                                        .osce_score_summary
                                                        .totalPossiblePoints} pts
                                                </span>
                                            </div>
                                        {:else}
                                            <span class="text-gray-400"
                                                >N/A</span
                                            >
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</PageLayout>
