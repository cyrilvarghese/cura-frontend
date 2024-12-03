<script lang="ts">
    import type { FeedbackResponse } from "$lib/types";

    export let feedback: FeedbackResponse;
    import { onMount } from "svelte";

    onMount(() => {
        console.log("Feedback received:", feedback);
    });

    const feedbackCategories = [
        { key: "history_taking", label: "History Taking" },
        { key: "examinations_performed", label: "Examinations" },
        { key: "tests_ordered", label: "Tests Ordered" },
        { key: "diagnostic_reasoning", label: "Diagnostic Reasoning" },
        { key: "synthesis_organization", label: "Synthesis & Organization" },
    ] as const;

    export function formatDiagnosis(diagnosisText: string) {
        // Remove duplicate labels that might appear in the text
        const cleanedText = diagnosisText
            .replace(/Primary Diagnosis:\s*Primary Diagnosis:/i, 'Primary Diagnosis:')
            .replace(/Final Diagnosis:\s*Primary Diagnosis:/i, 'Final Diagnosis:')
            .replace(/Differential Diagnoses:\s*Differential Diagnoses:/i, 'Differential Diagnoses:');

        // Split the text into three main sections: primary diagnosis, justification, and differential diagnoses
        const [primary, justification, differential] = cleanedText
            .split(/(?:Justification:|Differential Diagnoses:)/)
            .map(s => s.trim());

        // Extract justification text using regex with lookahead to find text between sections
        const justificationText = diagnosisText.match(/Justification:(.*?)(?=Differential Diagnoses:|$)/s)?.[1]?.trim() || '';

        return {
            primaryDiagnosis: primary.replace(/(?:Primary|Final) Diagnosis:/, '').trim(),
            justification: justificationText,
            differentialDiagnoses: differential
                ? differential.split(',').map(d => d.trim()).filter(Boolean) // Split by comma and remove empty entries
                : []
        };
    }
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border space-y-4">
    <!-- Overall Score -->
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Case Feedback</h3>
        <div
            class="text-xl font-bold {feedback.total_score >= 7
                ? 'text-green-500'
                : feedback.total_score >= 5
                  ? 'text-yellow-500'
                  : 'text-red-500'}"
        >
            {feedback.total_score.toFixed(1)}/10
        </div>
    </div>

    <!-- Detailed Feedback Categories -->
    <div class="space-y-3">
        {#each feedbackCategories as category}
            {@const categoryFeedback = feedback.feedback[category.key]}
            <div class="border-t pt-2">
                <div class="flex items-center justify-between">
                    <h4 class="font-medium">{category.label}</h4>
                    <span
                        class="font-semibold {categoryFeedback.score >= 7
                            ? 'text-green-500'
                            : categoryFeedback.score >= 5
                              ? 'text-yellow-500'
                              : 'text-red-500'}"
                    >
                        {categoryFeedback.score}/10
                    </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                    {categoryFeedback.comments}
                </p>
            </div>
        {/each}
    </div>

    <!-- Suggestions -->
    {#if feedback.suggestions}
        <div class="border-t pt-3">
            <h4 class="font-medium mb-2">Suggestions for Improvement</h4>
            <p class="text-sm text-muted-foreground">
                {feedback.suggestions}
            </p>
        </div>
    {/if}

    <!-- Relevant Actions -->
    {#if feedback.annotations.length > 0}
        <div class="border-t pt-3">
            <h4 class="font-medium mb-2">Action Analysis</h4>
            <div class="space-y-3">
                {#each feedback.annotations as annotation}
                    <div class="text-sm p-3 rounded-lg bg-muted/50 border">
                        <!-- Action Header -->
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-medium capitalize"
                                    >{annotation.step.replace("_", " ")}:</span
                                >
                                <span
                                    class="px-2 py-0.5 rounded-full text-xs font-medium
                                    {annotation.relevance === 'relevant' ||
                                    annotation.correctness === 'correct'
                                        ? 'bg-green-500/10 text-green-500'
                                        : annotation.relevance ===
                                                'irrelevant' ||
                                            annotation.correctness ===
                                                'incorrect'
                                          ? 'bg-red-500/10 text-red-500'
                                          : 'bg-yellow-500/10 text-yellow-500'}"
                                >
                                    {annotation.relevance ||
                                        annotation.correctness ||
                                        ""}
                                </span>
                            </div>
                        </div>

                        <!-- Action Content -->
                        {#if annotation.step === "diagnosis" || annotation.step === "final-diagnosis"}
                            <!-- Handle diagnosis data differently with structured format -->
                            {@const diagnosisData = formatDiagnosis(annotation.action)}
                            <div class="space-y-2">
                                {#if diagnosisData.primaryDiagnosis}
                                    <div>
                                        
                                        <span 
                                            >{diagnosisData.primaryDiagnosis}</span
                                        >
                                    </div>
                                {/if}

                                {#if diagnosisData.justification}
                                    <div>
                                        <span
                                            class="font-medium text-foreground/90"
                                            >Justification:</span
                                        >
                                        <div
                                            class="text-foreground/80 flex flex-wrap gap-1 items-center"
                                        >{diagnosisData.justification}</div>
                                    </div>
                                {/if}

                                {#if diagnosisData.differentialDiagnoses}
                                    <div>
                                        <span
                                            class="font-medium text-foreground/90"
                                            >Differential Diagnoses:</span
                                        >
                                        <ul class="ml-4 mt-1 list-disc space-y-1">
                                            {#each diagnosisData.differentialDiagnoses as differential}
                                                <li class="text-foreground/80">{differential}</li>
                                            {/each}
                                        </ul>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <!-- Display other actions (tests/examinations) as a bulleted list -->
                            <ul class="ml-4 list-disc space-y-1">
                                {#each annotation.action.split('\n').filter(Boolean) as item}
                                    <li class="text-sm text-foreground/80">
                                        <!-- Remove redundant 'Test:' or 'Examination:' prefixes from each item -->
                                        {item.replace(/^(Test|Examination):\s*/i, '')}
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                            
                        <p class="text-xs text-muted-foreground mt-2">
                            {annotation.justification}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
