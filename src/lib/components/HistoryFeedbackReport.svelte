<script lang="ts">
    import { feedbackStore } from "$lib/stores/feedbackStore";
    import type {
        HistoryFeedbackResponse,
        HistoryAETCOMResponse,
    } from "$lib/services/feedbackService";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";

    // Props using Svelte 5 $props syntax
    let { isOpen = false, onClose = () => {} } = $props();

    // State using Svelte 5 state syntax
    let { analysis, domain, error } = $state({
        analysis: null as HistoryFeedbackResponse | null,
        domain: null as HistoryAETCOMResponse | null,
        error: null as string | null,
    });

    // Reactive declarations using $derived
    $derived: {
        if (isOpen) {
            loadData();
        }
    }

    // Computed values using $derived
    const analysisLoading = $derived($feedbackStore.historyFeedbackLoading);
    const domainLoading = $derived($feedbackStore.historyFeedbackLoading);
    const missedHighlights = $derived(
        analysis?.analysis_result.missed_highlights ?? [],
    );
    const improvementHighlights = $derived(
        analysis?.analysis_result.improvement_highlights ?? [],
    );
    const domainScores = $derived(
        (analysis?.analysis_result.domain_score_summary ?? {}) as DomainScores,
    );
    const averageScore = $derived(
        Object.values(domainScores).reduce(
            (acc: number, curr: DomainScore) => acc + curr.score,
            0,
        ) / 8,
    );
    const finalFeedback = $derived(
        domain?.feedback_result.aetcom_evaluation ?? null,
    );

    async function loadData() {
        try {
            analysis = $feedbackStore.historyFeedback;
            domain = await feedbackStore.getAETCOMFeedback();
        } catch (e) {
            error =
                e instanceof Error
                    ? e.message
                    : "An error occurred while fetching feedback";
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    interface DomainScore {
        score: number;
        reason_for_score: string;
    }

    interface DomainScores {
        [key: string]: DomainScore;
    }

    function getScoreColor(score: number): string {
        return score >= 7
            ? "text-green-600"
            : score >= 4
              ? "text-yellow-600"
              : "text-red-600";
    }

    function getScoreBackground(score: number): string {
        if (score >= 7) {
            return "bg-green-50 border-green-200";
        } else if (score >= 4) {
            return "bg-yellow-50 border-yellow-200";
        } else {
            return "bg-red-50 border-red-200";
        }
    }
</script>

{#if isOpen}
    <Dialog.Root bind:open={isOpen}>
        <Dialog.Content class="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <Dialog.Header>
                <Dialog.Title>History Taking Feedback</Dialog.Title>
                <Dialog.Description>
                    Review your performance and areas for improvement in history
                    taking.
                </Dialog.Description>
            </Dialog.Header>

            <div class="w-full space-y-8">
                {#if error}
                    <div
                        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                        role="alert"
                    >
                        <p>{error}</p>
                    </div>
                {/if}

                <!-- Overall Performance Section -->
                <section
                    class="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out"
                >
                    <h2 class="text-2xl font-bold mb-4">Overall Performance</h2>
                    {#if analysisLoading}
                        <div
                            class="animate-pulse transition-opacity duration-300"
                        >
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    {:else}
                        <div class="flex items-center space-x-4">
                            <div
                                class="text-4xl font-bold {getScoreColor(
                                    averageScore,
                                )}"
                            >
                                {averageScore.toFixed(1)}/10
                            </div>
                            <div class="text-lg text-gray-600">
                                {averageScore >= 7
                                    ? "Excellent"
                                    : averageScore >= 4
                                      ? "Needs Improvement"
                                      : "Critical Improvement Needed"}
                            </div>
                        </div>
                    {/if}
                </section>

                <!-- Missed Questions Section -->
                <section
                    class="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out"
                >
                    <h2 class="text-2xl font-bold mb-4">
                        Missed Key Questions
                    </h2>
                    {#if analysisLoading}
                        <div class="space-y-4">
                            {#each Array(3) as _}
                                <div
                                    class="animate-pulse transition-opacity duration-300"
                                >
                                    <div
                                        class="h-4 bg-gray-200 rounded w-full mb-2"
                                    ></div>
                                    <div
                                        class="h-4 bg-gray-200 rounded w-3/4"
                                    ></div>
                                </div>
                            {/each}
                        </div>
                    {:else if missedHighlights.length > 0}
                        <div class="grid gap-4 md:grid-cols-2">
                            {#each missedHighlights as highlight}
                                <div
                                    class="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                                >
                                    <h3 class="font-semibold text-red-700">
                                        {highlight.missed_question}
                                    </h3>
                                    <p class="text-sm text-gray-600 mt-1">
                                        {highlight.why_important}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>

                <!-- Domain Performance Section -->
                <section
                    class="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out"
                >
                    <h2 class="text-2xl font-bold mb-4">
                        Performance by Domain
                    </h2>
                    {#if analysisLoading}
                        <div class="space-y-4">
                            {#each Array(3) as _}
                                <div
                                    class="animate-pulse transition-opacity duration-300"
                                >
                                    <div
                                        class="h-4 bg-gray-200 rounded w-full mb-2"
                                    ></div>
                                    <div
                                        class="h-4 bg-gray-200 rounded w-2/3"
                                    ></div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="grid gap-4 md:grid-cols-2">
                            {#each Object.entries(domainScores) as [domain, data]}
                                {@const score = (data as DomainScore).score}
                                <div
                                    class="border rounded-lg p-4 transition-colors duration-200 {getScoreBackground(
                                        score,
                                    )}"
                                >
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <h3
                                            class="font-semibold text-lg capitalize"
                                        >
                                            {domain.replace(/_/g, " ")}
                                        </h3>
                                        <div class="flex items-center">
                                            <span
                                                class="text-2xl font-bold {getScoreColor(
                                                    score,
                                                )}"
                                            >
                                                {score}/10
                                            </span>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-600 mt-2">
                                        {(data as DomainScore).reason_for_score}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>

                <!-- Improvement Areas Section -->
                <section
                    class="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out"
                >
                    <h2 class="text-2xl font-bold mb-4">
                        Areas for Improvement
                    </h2>
                    {#if analysisLoading}
                        <div class="space-y-4">
                            {#each Array(2) as _}
                                <div
                                    class="animate-pulse transition-opacity duration-300"
                                >
                                    <div
                                        class="h-4 bg-gray-200 rounded w-full mb-2"
                                    ></div>
                                    <div
                                        class="h-4 bg-gray-200 rounded w-5/6"
                                    ></div>
                                </div>
                            {/each}
                        </div>
                    {:else if improvementHighlights.length > 0}
                        <div class="space-y-4">
                            {#each improvementHighlights as highlight}
                                <div
                                    class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
                                >
                                    <h3 class="font-semibold text-blue-700">
                                        {highlight.area}
                                    </h3>
                                    <p class="text-sm text-gray-600 mt-1">
                                        {highlight.suggestion}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>

                <!-- Final Feedback Section -->
                <!-- {#if finalFeedback}
                    <section
                        class="bg-white rounded-lg shadow p-6 transition-all duration-300 ease-in-out"
                    >
                        <h2 class="text-2xl font-bold mb-4">
                            Additional Feedback
                        </h2>
                        {#if domainLoading}
                            <div class="space-y-4">
                                {#each Array(3) as _}
                                    <div
                                        class="animate-pulse transition-opacity duration-300"
                                    >
                                        <div
                                            class="h-4 bg-gray-200 rounded w-full mb-2"
                                        ></div>
                                        <div
                                            class="h-4 bg-gray-200 rounded w-5/6"
                                        ></div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="space-y-6">
                                <div>
                                    <h3
                                        class="text-lg font-semibold text-green-600 mb-2"
                                    >
                                        Strengths
                                    </h3>
                                    <p class="text-gray-700">
                                        {finalFeedback.communication}
                                    </p>
                                </div>
                                <div>
                                    <h3
                                        class="text-lg font-semibold text-yellow-600 mb-2"
                                    >
                                        Areas to Improve
                                    </h3>
                                    <p class="text-gray-700">
                                        {finalFeedback.empathy_patient_centeredness}
                                    </p>
                                </div>
                                <div>
                                    <h3
                                        class="text-lg font-semibold text-blue-600 mb-2"
                                    >
                                        Actionable Suggestions
                                    </h3>
                                    <p class="text-gray-700">
                                        {finalFeedback.information_gathering}
                                    </p>
                                </div>
                            </div>
                        {/if}
                    </section>
                {/if} -->
            </div>

            <Dialog.Footer>
                <Dialog.Close>
                    <Button variant="outline" onclick={onClose}>Close</Button>
                </Dialog.Close>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
{/if}
