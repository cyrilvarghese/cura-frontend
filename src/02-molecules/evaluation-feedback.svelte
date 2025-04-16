<script lang="ts">
    import * as Alert from "$lib/components/ui/alert";
    import { Button } from "$lib/components/ui/button";
    import {
        AlertTriangle,
        ChevronDown,
        ChevronUp,
        Target,
    } from "lucide-svelte";
    import type { EvaluationResponse } from "$lib/services/evaluationService";

    const { evaluation, onContinue } = $props<{
        evaluation: EvaluationResponse;
        onContinue: () => void;
    }>();

    let expandedQuestions = $state(new Set<number>());
    let showMissingFindings = $state(false);

    function toggleQuestion(index: number) {
        if (expandedQuestions.has(index)) {
            expandedQuestions.delete(index);
        } else {
            expandedQuestions.add(index);
        }
        expandedQuestions = new Set(expandedQuestions);
    }

    let emoji = $derived(
        evaluation.feedback.missing_findings.length === 0
            ? "🌟"
            : evaluation.feedback.missing_findings.length === 1
              ? "💪"
              : "🤔",
    );

    // Function to convert markdown-style asterisks to HTML bold tags
    function formatMessage(text: string) {
        // Replace text between asterisks with bold tags
        return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    }
</script>

<div>
    <Alert.Root class="mt-4 bg-blue-50">
        <Alert.Description>
            <div class="flex flex-col gap-4">
                <p class="flex flex-row justify-between items-center gap-2">
                    <button
                        class="mt-2 text-sm flex flex-row text-left text-blue-600 hover:text-blue-800 flex items-start gap-1"
                        onclick={() => {
                            // Toggle showing the missing findings section
                            showMissingFindings = !showMissingFindings;
                        }}
                    >
                        {emoji}

                        <span class="text-base text-left">
                            {@html formatMessage(evaluation.feedback.message)}
                        </span>
                        <ChevronDown
                            class="hover:bg-gray-200/50 size-6 mt-1 ml-2 text-gray-500"
                        />
                    </button>
                </p>

                {#if showMissingFindings && evaluation.feedback.missing_findings.length > 0}
                    <div class="space-y-3 pt-4">
                        {#each evaluation.feedback.missing_findings as finding, index}
                            <div class="border rounded-lg overflow-hidden">
                                <button
                                    class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onclick={() => toggleQuestion(index)}
                                >
                                    <div
                                        class="flex items-center justify-between gap-2"
                                    >
                                        <span>{finding.question}</span>
                                        {#if expandedQuestions.has(index)}
                                            <ChevronUp
                                                class="size-4 text-gray-500"
                                            />
                                        {:else}
                                            <ChevronDown
                                                class="size-4 text-gray-500"
                                            />
                                        {/if}
                                    </div>
                                </button>

                                {#if expandedQuestions.has(index)}
                                    <div class="p-3 bg-white border-t">
                                        <p class="text-gray-600">
                                            {finding.reason}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </Alert.Description>
    </Alert.Root>
</div>
