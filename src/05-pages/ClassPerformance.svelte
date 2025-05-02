<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import PageLayout from "../04-templates/page-layout.svelte";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import { teachingStore } from "$lib/stores/classPerfStore";
    import { currentDepartment } from "$lib/stores/teamStore";
    import type { CaseSessionData } from "$lib/services/classPerfDataService";
    import { Search } from "lucide-svelte";

    // Add search query state
    let searchQuery = $state("");

    // Subscribe to the teaching store
    let sessionData = $state<CaseSessionData[]>([]);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let department = $state("");

    // Store unsubscribe functions
    const teachingUnsubscribe = teachingStore.subscribe((state) => {
        sessionData = state.sessionData || [];
        isLoading = state.isLoading;
        error = state.error;
    });

    const departmentUnsubscribe = currentDepartment.subscribe((dept) => {
        if (dept) {
            department = dept.name;
        }
    });

    // Clean up subscriptions on component destroy
    onDestroy(() => {
        teachingUnsubscribe();
        departmentUnsubscribe();
    });

    // Make sure to initialize the store data on mount
    onMount(() => {
        if (department) {
            teachingStore.getTeachingSessions(department.toLowerCase());
        }
    });

    // Sort sessions by date (most recent first) and filter by search query
    let filteredSessions = $derived(
        [...sessionData]
            .filter(
                (session) =>
                    !searchQuery ||
                    session.primary_diagnosis
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    session.student_name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
            )
            .sort(
                (a, b) =>
                    new Date(b.session_start).getTime() -
                    new Date(a.session_start).getTime(),
            ),
    );

    // Format date in a readable format
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // Calculate session duration in minutes
    function getSessionDuration(start: string, end: string) {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const durationMs = endTime - startTime;
        return Math.round(durationMs / (1000 * 60));
    }

    // Function to get color based on score
    function getScoreColor(score: number): string {
        if (score >= 7) return "text-green-600";
        if (score >= 5) return "text-green-500";
        if (score >= 4) return "text-yellow-500";
        return "text-red-500";
    }
</script>

<LoadingOverlay isVisible={isLoading} message="Loading teaching data..." />

<PageLayout
    breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Class Performance" },
    ]}
>
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold">Class Performance</h1>
            <p class="text-gray-500 text-sm">
                View the performance of the students in your class
            </p>
        </div>
        <div class="relative">
            <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
                <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="search"
                placeholder="Search by student name or case..."
                bind:value={searchQuery}
                class="pl-10 px-4 w-[320px] py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>
    <hr class="border-gray-200 mb-4" />

    {#if error}
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-red-500 text-center">
                <p>Error loading class performance data: {error}</p>
                <button
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onclick={() => {
                        if (department) {
                            teachingStore.getTeachingSessions(
                                department.toLowerCase(),
                            );
                        }
                    }}
                >
                    Retry
                </button>
            </div>
        </div>
    {:else if !department}
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-600">
                Please select a department to view class performance data.
            </p>
        </div>
    {:else if sessionData.length === 0 && !isLoading}
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-600">
                No class performance data available for {department}.
            </p>
        </div>
    {:else if filteredSessions.length === 0 && searchQuery}
        <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-center text-gray-600">
                No cases matching "{searchQuery}" found.
            </p>
        </div>
    {:else}
        <div class="mt-4">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b">
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Student
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Case
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Duration
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                History
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Physical Exams
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tests
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Diagnosis
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Reasoning
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Differentials
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each filteredSessions as session}
                            <tr class="hover:bg-gray-50">
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    <div
                                        class="truncate w-[90px]"
                                        title={session.student_name}
                                    >
                                        {session.student_name}
                                    </div>
                                </td>
                                <td
                                    title={session.primary_diagnosis.toString()}
                                    class="cursor-pointer px-6 py-4 whitespace-nowrap text-sm w-[200px] truncate text-gray-900"
                                >
                                    <div class="truncate w-[150px]">
                                        {session.primary_diagnosis}
                                    </div>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {getSessionDuration(
                                        session.session_start,
                                        session.session_end,
                                    )} min
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(
                                            session.history_taking,
                                        )}
                                        title="History Taking Score"
                                    >
                                        {session.history_taking.toFixed(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(
                                            session.physical_exams,
                                        )}
                                        title="Physical Examination Score"
                                    >
                                        {session.physical_exams.toFixed(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(
                                            session.test_ordering,
                                        )}
                                        title="Test Ordering Score"
                                    >
                                        {session.test_ordering.toFixed(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(
                                            session.diagnosis_accuracy,
                                        )}
                                        title="Diagnosis Accuracy Score"
                                    >
                                        {session.diagnosis_accuracy.toFixed(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(session.reasoning)}
                                        title="Clinical Reasoning Score"
                                    >
                                        {session.reasoning.toFixed(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        class={getScoreColor(
                                            session.differentials,
                                        )}
                                        title="Differential Diagnoses Score"
                                    >
                                        {session.differentials.toFixed(1)}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</PageLayout>
