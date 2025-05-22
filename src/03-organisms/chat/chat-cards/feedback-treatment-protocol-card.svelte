<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import ClipboardCheck from "lucide-svelte/icons/clipboard-check";
    import {
        ArrowRight,
        CheckCircle,
        ChevronDown,
        AlertTriangle,
        Pill,
        ThumbsUp,
        ThumbsDown,
        Info,
        AlertCircle,
    } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import type { TreatmentProtocolFeedback } from "$lib/services/treatmentFeedbackService";

    // Accept the feedback as a prop
    const { feedback } = $props<{ feedback: TreatmentProtocolFeedback }>();

    // State for accordion sections
    let openAccordion = $state<string[]>(["evaluation", "implications"]);
</script>

<Card.Root class="w-[calc(100%-44px)] border rounded-lg shadow-sm bg-white">
    <Card.Header>
        <div class="space-y-2">
            <div class="flex items-center gap-2 text-blue-900">
                <ClipboardCheck class="h-5 w-5" />
                <Card.Title class="text-xl"
                    >Treatment Protocol Feedback</Card.Title
                >
            </div>
            <Badge
                variant="outline"
                class="bg-blue-50/50 text-blue-800 hover:bg-blue-50/80 border-blue-200"
            >
                {feedback.student_diagnosis_acknowledged}
            </Badge>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-5">
            <!-- Key takeaway message section -->
            <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div class="flex items-start gap-3">
                    <Info class="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 class="font-medium text-blue-900 mb-1">
                            Key Takeaway
                        </h3>
                        <p class="text-sm text-blue-800">
                            {feedback.key_takeaway_message_on_drug_therapy}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Accordion sections for detailed feedback -->
            <Accordion.Root
                class="space-y-2"
                type="multiple"
                value={openAccordion}
            >
                <!-- Drug Plan Evaluation -->
                <Accordion.Item value="evaluation">
                    <Accordion.Trigger
                        class="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 data-[state=open]:border-blue-500 border-blue-200"
                    >
                        <div class="flex items-center gap-2">
                            <span>Drug Plan Evaluation</span>
                            {#if feedback.student_drug_plan_evaluation.appropriateness_of_student_choices_for_scenario}
                                <ThumbsUp class="h-4 w-4 text-green-600" />
                            {:else}
                                <ThumbsDown class="h-4 w-4 text-red-600" />
                            {/if}
                        </div>
                    </Accordion.Trigger>
                    <Accordion.Content
                        class="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-500 ease-out"
                    >
                        <div
                            class="p-4 space-y-4"
                            in:slide={{
                                duration: 800,
                                delay: 100,
                                easing: cubicOut,
                            }}
                            out:slide={{ duration: 600, easing: cubicOut }}
                        >
                            <!-- Patient scenario -->
                            <div class="space-y-1">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Patient Scenario
                                </h3>
                                <p
                                    class="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                                >
                                    {feedback.student_drug_plan_evaluation
                                        .assumed_patient_scenario_from_context}
                                </p>
                            </div>

                            <!-- Student's prescribed drugs -->
                            <div class="space-y-2">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Your Treatment Plan
                                </h3>
                                <ul
                                    class="space-y-1 ml-5 list-disc text-sm text-gray-600"
                                >
                                    {#each feedback.student_drug_plan_evaluation.student_prescribed_drugs_summary as drug}
                                        <li>{drug}</li>
                                    {/each}
                                </ul>
                            </div>

                            <!-- Feedback on choices -->
                            <div class="space-y-1">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Feedback on Drug Choices
                                </h3>
                                <div
                                    class={feedback.student_drug_plan_evaluation
                                        .appropriateness_of_student_choices_for_scenario
                                        ? "bg-green-50 border border-green-200 p-3 rounded-md text-sm text-green-800"
                                        : "bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-800"}
                                >
                                    <div class="flex items-start gap-2">
                                        {#if feedback.student_drug_plan_evaluation.appropriateness_of_student_choices_for_scenario}
                                            <CheckCircle
                                                class="h-4 w-4 mt-0.5 flex-shrink-0"
                                            />
                                        {:else}
                                            <AlertTriangle
                                                class="h-4 w-4 mt-0.5 flex-shrink-0"
                                            />
                                        {/if}
                                        <p>
                                            {feedback
                                                .student_drug_plan_evaluation
                                                .feedback_on_drug_choices}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Ideal drugs -->
                            <div class="space-y-2">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Ideal Drugs for This Scenario
                                </h3>
                                <div class="space-y-2">
                                    {#each feedback.student_drug_plan_evaluation.ideal_drugs_for_this_scenario_from_context as drug}
                                        <div
                                            class="bg-blue-50 p-3 rounded-md border border-blue-200"
                                        >
                                            <div
                                                class="flex items-center gap-2 mb-1"
                                            >
                                                <Pill
                                                    class="h-4 w-4 text-blue-700"
                                                />
                                                <span
                                                    class="font-medium text-blue-800"
                                                    >{drug.drug_name}</span
                                                >
                                            </div>
                                            <p
                                                class="text-sm text-blue-700 ml-6"
                                            >
                                                {drug.brief_rationale}
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                <!-- Clinical Implications -->
                <Accordion.Item value="implications">
                    <Accordion.Trigger
                        class="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 data-[state=open]:border-purple-500 border-purple-200"
                    >
                        <div class="flex items-center gap-2">
                            <span>Clinical Implications</span>
                            <AlertCircle class="h-4 w-4 text-purple-700" />
                        </div>
                    </Accordion.Trigger>
                    <Accordion.Content
                        class="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-500 ease-out"
                    >
                        <div
                            class="p-4 space-y-4"
                            in:slide={{
                                duration: 800,
                                delay: 100,
                                easing: cubicOut,
                            }}
                            out:slide={{ duration: 600, easing: cubicOut }}
                        >
                            <div
                                class="bg-purple-50 border border-purple-200 p-3 rounded-md"
                            >
                                <p class="text-sm text-purple-800">
                                    {feedback
                                        .clinical_implications_of_students_plan
                                        .summary}
                                </p>
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                <!-- Ideal Drug Therapy -->
                <Accordion.Item value="ideal-therapy">
                    <Accordion.Trigger
                        class="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50 data-[state=open]:border-green-500 border-green-200"
                    >
                        <div class="flex items-center gap-2">
                            <span
                                >Ideal Drug Therapy for {feedback
                                    .ideal_drug_therapy_for_learning
                                    .diagnosis_context}</span
                            >
                            <CheckCircle class="h-4 w-4 text-green-600" />
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
                            <!-- Treatment options by scenario -->
                            {#each feedback.ideal_drug_therapy_for_learning.treatment_options_by_scenario as option}
                                <div class="space-y-3">
                                    <h3
                                        class="text-sm font-medium text-gray-700 capitalize"
                                    >
                                        {option.scenario.replace(/_/g, " ")}
                                    </h3>
                                    <div class="space-y-2 ml-1">
                                        {#each option.recommended_drugs as drug}
                                            <div
                                                class="bg-green-50 p-3 rounded-md border border-green-200"
                                            >
                                                <div
                                                    class="flex items-center gap-2 mb-1"
                                                >
                                                    <Pill
                                                        class="h-4 w-4 text-green-700"
                                                    />
                                                    <span
                                                        class="font-medium text-green-800"
                                                        >{drug.drug_name}</span
                                                    >
                                                    <span
                                                        class="text-xs text-green-700"
                                                        >({drug.details_brief})</span
                                                    >
                                                </div>
                                                <p
                                                    class="text-sm text-green-700 ml-6"
                                                >
                                                    {drug.rationale_brief}
                                                </p>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/each}

                            <!-- Critical adjunctive therapy notes -->
                            <div class="space-y-3 pt-2">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Critical Adjunctive Therapy Notes
                                </h3>
                                <ul
                                    class="space-y-1 ml-6 list-disc text-sm text-gray-600"
                                >
                                    {#each feedback.ideal_drug_therapy_for_learning.critical_adjunctive_therapy_notes as note}
                                        <li>{note}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    </Card.Content>
</Card.Root>
