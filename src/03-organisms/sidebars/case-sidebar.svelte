<script lang="ts">
    import { API_BASE_URL } from "$lib/config/api";
    import { patientFile, sendMessage } from "$lib/stores/apiStore";
    import type {
        ImageData,
        PatientFileItem,
        UnmatchedQuestion,
    } from "$lib/types";
    import historyMatchStore, {
        domainStatsStore,
        refreshHistoryMatchData,
    } from "$lib/stores/historyMatchStore";
    import {
        Dialog,
        DialogContent,
        DialogOverlay,
        DialogTitle,
        DialogClose,
    } from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { onMount, onDestroy } from "svelte";
    import { ArrowRight, Check, Info, ThumbsUp } from "lucide-svelte";

    // Add the onNextClick prop
    const { onNextClick = () => {}, currentStep = "diagnosis" } = $props();

    // Define types for our data
    interface DomainStat {
        completed: number;
        total: number;
        percent_complete: number;
    }

    // Define initial state
    const initialState = {
        showUnmatchedPopup: false,
        domainStats: {} as Record<string, DomainStat>,
        unmatchedQuestions: [] as UnmatchedQuestion[],
        overallProgress: {
            completed: 0,
            total: 0,
            percent_complete: 0,
        } as DomainStat,
        showNextButton: false,
    };

    // Local state variables
    let showUnmatchedPopup = $state(initialState.showUnmatchedPopup);
    let domainStats = $state<Record<string, DomainStat>>(
        initialState.domainStats,
    );
    let unmatchedQuestions = $state<UnmatchedQuestion[]>(
        initialState.unmatchedQuestions,
    );
    let overallProgress = $state<DomainStat>(initialState.overallProgress);
    let showNextButton = $state(initialState.showNextButton);

    // For store subscriptions
    let domainStatsUnsubscribe: Function;
    let historyMatchUnsubscribe: Function;

    // Reset to initial state
    function resetState() {
        showUnmatchedPopup = initialState.showUnmatchedPopup;
        domainStats = initialState.domainStats;
        unmatchedQuestions = initialState.unmatchedQuestions;
        overallProgress = { ...initialState.overallProgress };
        showNextButton = initialState.showNextButton;
        console.log("Resetting case-sidebar state and stores");

        historyMatchStore.set({
            domain_stats: {},
            unmatched_questions: [],
            metadata: {
                total_expected_questions: 0,
                total_student_questions: 0,
                total_unmatched_questions: 0,
                processing_time_seconds: 0,
                model_version: "",
            },
        });
    }

    onMount(() => {
        // Reset all state on mount
        resetState();

        // Refresh data on mount
        // refreshHistoryMatchData();

        // Subscribe to domain stats store
        domainStatsUnsubscribe = domainStatsStore.subscribe((storeValue) => {
            if (storeValue) {
                // Extract non-overall domains
                const nonOverallDomains: Record<string, DomainStat> = {};

                Object.entries(storeValue).forEach(([domain, stats]) => {
                    if (domain !== "Overall") {
                        nonOverallDomains[domain] = stats as DomainStat;
                    }
                });

                // Update local state
                domainStats = nonOverallDomains;

                // Update overall progress
                if (storeValue.Overall) {
                    overallProgress = storeValue.Overall as DomainStat;
                    showNextButton = overallProgress.percent_complete >= 60;
                }
            }
        });

        // Subscribe to unmatched questions
        historyMatchUnsubscribe = historyMatchStore.subscribe((storeValue) => {
            if (storeValue?.unmatched_questions) {
                unmatchedQuestions = [...storeValue.unmatched_questions];
            }
        });
    });

    onDestroy(() => {
        // Clean up subscriptions
        if (domainStatsUnsubscribe) domainStatsUnsubscribe();
        if (historyMatchUnsubscribe) historyMatchUnsubscribe();
    });

    // Toggle popup visibility
    function toggleUnmatchedPopup() {
        showUnmatchedPopup = !showUnmatchedPopup;
    }

    // Update the function to use the prop
    function handleNextClick() {
        onNextClick();
        console.log("Moving to next section");
    }

    // Function to get question text (handles both string and object formats)
    function getQuestionText(question: UnmatchedQuestion) {
        if (typeof question === "string") return question;
        if (question && typeof question === "object") {
            // Return the first property that looks like text
            return question.question || JSON.stringify(question);
        }
        return "Unknown question";
    }

    // Function to format domain names (convert underscores to spaces and capitalize words)
    function formatDomainName(domain: string): string {
        return domain
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
</script>

<div class="flex-col w-full pt-6 h-full">
    <div class="border-b border-gray-200 pb-6">
        <h2 class="text-lg font-semibold">History Progress</h2>

        <!-- Domain progress bars -->
        <div class="mt-8 space-y-4">
            {#each Object.entries(domainStats) as [domain, stats]}
                <div class="space-y-1">
                    <div class="flex justify-between items-center">
                        <h3 class="text-sm font-medium text-gray-700">
                            {formatDomainName(domain)}
                        </h3>
                        <span
                            class="text-xs text-gray-500 flex items-center gap-1"
                        >
                            {#if stats.completed === stats.total}
                                <span class="text-green-500"> Complete </span>
                                <Check class="h-3 w-3 text-green-500" />
                            {:else}
                                {stats.total - stats.completed}
                                {stats.total - stats.completed === 1
                                    ? "question"
                                    : "questions"} left
                            {/if}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                            class="bg-gradient-to-r from-blue-200 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style="width: {stats.percent_complete}%"
                        ></div>
                    </div>
                </div>
            {/each}

            <!-- Overall progress -->
            <div class="space-y-1 pt-2 border-t border-gray-100">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-gray-700">
                        Overall Progress
                    </h3>
                    {#if overallProgress.completed !== 0}
                        <span
                            class="text-xs text-gray-500 flex items-center gap-1"
                        >
                            {#if overallProgress.completed === overallProgress.total}
                                <span class="text-green-500"
                                    >Complete <ThumbsUp
                                        class="h-3 w-3 text-green-500"
                                    />
                                </span>
                            {:else}
                                {overallProgress.total -
                                    overallProgress.completed}
                                {overallProgress.total -
                                    overallProgress.completed ===
                                1
                                    ? "question"
                                    : "questions"} left
                            {/if}
                        </span>
                    {:else if overallProgress.completed === 0}
                        <span
                            class="text-xs text-gray-500 flex items-center gap-1"
                        >
                            Start History Taking
                        </span>
                    {/if}
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        class="{overallProgress.percent_complete < 30
                            ? 'bg-red-500'
                            : overallProgress.percent_complete < 60
                              ? 'bg-orange-500'
                              : 'bg-green-500'} h-2.5 rounded-full transition-all duration-300"
                        style="width: {overallProgress.percent_complete}%"
                    ></div>
                </div>
            </div>

            <!-- Link to show unmatched questions -->
            {#if overallProgress.completed !== 0}
                <div class="mt-4 pt-2 border-t border-gray-100">
                    <Button
                        onclick={toggleUnmatchedPopup}
                        variant="link"
                        class="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto flex items-center gap-1"
                    >
                        <Info class="h-4 w-4" />
                        Show suggested questions
                    </Button>
                </div>
            {/if}
            <!-- Next button - appears when progress is ≥ 80% -->
            {#if showNextButton}
                <div class="mt-6 flex justify-start">
                    <Button
                        onclick={handleNextClick}
                        variant="default"
                        class="flex items-center justify-center gap-2"
                    >
                        {#if currentStep === "diagnosis"}
                            Submit Diagnosis
                        {:else if currentStep === "final-diagnosis"}
                            Submit Final Diagnosis
                        {:else if currentStep === "pre-treatment"}
                            Submit Pre-Treatment Investigations
                        {:else if currentStep === "treatment-protocol"}
                            Submit Treatment Protocol
                        {/if}
                    </Button>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Unmatched Questions Dialog -->
<Dialog bind:open={showUnmatchedPopup}>
    <DialogOverlay />
    <DialogContent
        class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
    >
        <div class="flex justify-between items-center mb-4">
            <DialogTitle class="text-lg font-semibold"
                >Suggested Questions</DialogTitle
            >
        </div>

        {#if unmatchedQuestions.length > 0}
            <div class="space-y-3 my-2">
                {#each unmatchedQuestions as question}
                    <Button
                        variant="outline"
                        class="w-full justify-start p-4 h-auto bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-left"
                        onclick={() => {
                            // Add logic to send this question to chat if needed
                            showUnmatchedPopup = false;
                            sendMessage(
                                getQuestionText(question),
                                "student",
                                "patient_history",
                                "text",
                            );
                        }}
                    >
                        <p
                            class="text-gray-800 whitespace-normal break-words w-full overflow-hidden"
                        >
                            {getQuestionText(question)}
                        </p>
                    </Button>
                {/each}
            </div>
        {:else}
            <p class="text-gray-500 text-center py-4">
                No suggested questions available at this time.
            </p>
        {/if}

        <div class="mt-6 pt-2 border-t border-gray-100">
            <Button
                onclick={() => (showUnmatchedPopup = false)}
                variant="default"
                class="w-full py-3"
            >
                Close
            </Button>
        </div>
    </DialogContent>
</Dialog>
