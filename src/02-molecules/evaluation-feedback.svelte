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
</script>

<div>
    <Alert.Root class="mt-4">
        <Alert.Description>
            <div class="flex flex-col gap-4">
                <p class="flex flex-row justify-between items-center gap-2">
                    {#if evaluation.feedback.missing_findings.length > 0}
                        <button
                            class="mt-2 text-sm flex flex-row text-left text-blue-600 hover:text-blue-800 flex items-start gap-1"
                            onclick={() => (expandedQuestions = new Set())}
                        >
                            {emoji}

                            <span class="text-sm text-left">
                                {evaluation.feedback.message}
                            </span>
                        </button>
                    {:else}
                        <span class="flex flex-row text-left text-blue-600">
                            {emoji}

                            <span class="text-sm text-left">
                                {evaluation.feedback.message}
                            </span>
                        </span>
                    {/if}
                </p>

                <div class="space-y-3">
                    {#each evaluation.feedback.missing_findings as finding, index}
                        <div class="border rounded-lg overflow-hidden">
                            <button
                                class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                onclick={() => toggleQuestion(index)}
                            >
                                <div
                                    class="flex items-center justify-between gap-2"
                                >
                                    <span class="text-blue-600"
                                        >{finding.question}</span
                                    >
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
            </div>
        </Alert.Description>
    </Alert.Root>
</div>
