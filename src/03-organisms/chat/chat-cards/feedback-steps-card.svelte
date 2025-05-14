<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import ClipboardCheck from "lucide-svelte/icons/clipboard-check";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { ArrowRight, CheckCircle, ChevronDown } from "lucide-svelte";
    import { feedbackStore } from "$lib/stores/feedbackStore";
    import { toast } from "svelte-sonner";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { fade, slide } from "svelte/transition";
    import type {
        HistoryFeedbackResponse,
        AETCOMFeedbackResponse,
        DiagnosisFeedbackResponse,
    } from "$lib/services/feedbackService";
    import HistoryFeedbackContent from "./history-feedback-content.svelte";
    import AETCOMFeedbackContent from "./aetcom-feedback-content.svelte";
    import DiagnosisFeedbackContent from "./diagnosis-feedback-content.svelte";

    let feedback = $state({
        history: {} as HistoryFeedbackResponse | null,
        aetcom: {} as AETCOMFeedbackResponse | null,
        diagnosis: {} as DiagnosisFeedbackResponse | null,
    });

    let loadingStates = $state({
        history: true,
        aetcom: false,
        diagnosis: false,
    });

    let completedStates = $state({
        history: false,
        aetcom: false,
        diagnosis: false,
    });

    let selectedStep = $state<"history" | "aetcom" | "diagnosis" | null>(null);
    let openAccordion = $state<string[]>([]);

    // Double the delay between accordion transitions for a more gradual experience
    const transitionDelay = 800; // milliseconds

    async function loadFeedback() {
        try {
            // History feedback
            const historyFeedback = await feedbackStore.getHistoryFeedback();
            feedback.history = historyFeedback;
            loadingStates.history = false;
            completedStates.history = true;
            // Add history to open accordions
            setTimeout(() => {
                openAccordion = [...openAccordion, "history"];
            }, transitionDelay);
            loadingStates.aetcom = true;

            // AETCOM feedback
            const aetcomFeedback = await feedbackStore.getAETCOMFeedback();
            feedback.aetcom = aetcomFeedback;
            loadingStates.aetcom = false;
            completedStates.aetcom = true;
            // Add aetcom to open accordions
            setTimeout(() => {
                openAccordion = [...openAccordion, "aetcom"];
            }, transitionDelay);
            loadingStates.diagnosis = true;

            // Diagnosis feedback
            const diagnosisFeedback =
                await feedbackStore.getDiagnosisFeedback();
            feedback.diagnosis = diagnosisFeedback;
            loadingStates.diagnosis = false;
            completedStates.diagnosis = true;
            // Add diagnosis to open accordions
            setTimeout(() => {
                openAccordion = [...openAccordion, "diagnosis"];
            }, transitionDelay);
        } catch (error) {
            console.error("Error loading feedback:", error);
            toast.error("Failed to load feedback", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            });
        }
    }

    function handleTreatmentPlanClick() {
        // Find the pre-treatment button by ID and click it
        const button = document.getElementById("treatment-plan");
        if (button) {
            button.click();
        }
    }

    // Start loading feedback when component mounts
    loadFeedback();
</script>

<Card.Root class="w-[calc(100%-44px)] border rounded-lg shadow-sm bg-white">
    <Card.Header>
        <div class="space-y-2">
            <div class="flex items-center gap-2 text-blue-900">
                <ClipboardCheck class="h-5 w-5" />
                <Card.Title class="text-xl">Case Feedback</Card.Title>
            </div>
            <Badge
                variant="outline"
                class="bg-blue-50/50 text-blue-800 hover:bg-blue-50/80 border-blue-200"
            >
                Breakdown of Feedback
            </Badge>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-4">
            <Accordion.Root
                class="space-y-2"
                type="multiple"
                value={openAccordion}
            >
                {#each ["history", "aetcom", "diagnosis"] as step}
                    <Accordion.Item value={step}>
                        <Accordion.Trigger
                            class="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 data-[state=open]:border-green-500 {completedStates[
                                step as keyof typeof completedStates
                            ]
                                ? 'border-green-500'
                                : ''}"
                            disabled={!completedStates[
                                step as keyof typeof completedStates
                            ]}
                        >
                            <div class="flex items-center gap-2">
                                <span class="capitalize"
                                    >{step === "aetcom" ? "AETCOM" : step} Feedback</span
                                >
                                {#if loadingStates[step as keyof typeof loadingStates]}
                                    <Loader2 class="h-4 w-4 animate-spin" />
                                {:else if completedStates[step as keyof typeof completedStates]}
                                    <CheckCircle
                                        class="h-4 w-4 text-green-600"
                                    />
                                {/if}
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content
                            class="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-500 ease-out"
                        >
                            <div
                                class="p-4 space-y-6"
                                in:slide={{
                                    duration: 800,
                                    delay: 100,
                                    easing: cubicOut,
                                }}
                                out:slide={{ duration: 600, easing: cubicOut }}
                            >
                                {#if step === "history" && feedback.history?.analysis_result}
                                    <HistoryFeedbackContent
                                        feedback={feedback.history}
                                    />
                                {:else if step === "aetcom" && feedback.aetcom?.feedback_result}
                                    <AETCOMFeedbackContent
                                        feedback={feedback.aetcom}
                                    />
                                {:else if step === "diagnosis" && feedback.diagnosis?.feedback_result}
                                    <DiagnosisFeedbackContent
                                        feedback={feedback.diagnosis}
                                    />
                                {:else}
                                    <p class="text-sm">
                                        {feedback[
                                            step as keyof typeof feedback
                                        ]}
                                    </p>
                                {/if}
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                {/each}
            </Accordion.Root>

            <!-- <Button
                variant="default"
                disabled={!completedStates.diagnosis}
                onclick={handleTreatmentPlanClick}
            >
                Ready for Treatment Plan
                <ArrowRight class="h-4 w-4" />
            </Button> -->
        </div>
    </Card.Content>
</Card.Root>
