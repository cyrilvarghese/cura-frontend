<script lang="ts">
    import type { FeedbackResponse } from "$lib/types";
    
    export let feedback: FeedbackResponse;
    import { onMount } from 'svelte';

    onMount(() => {
        console.log('Feedback received:', feedback);
    });

    const feedbackCategories = [
        { key: 'history_taking', label: 'History Taking' },
        { key: 'examinations_performed', label: 'Examinations' },
        { key: 'tests_ordered', label: 'Tests Ordered' },
        { key: 'diagnostic_reasoning', label: 'Diagnostic Reasoning' },
        { key: 'synthesis_organization', label: 'Synthesis & Organization' }
    ] as const;

    function formatDiagnosisAction(action: string) {
        const parts = action.split('\n');
        const result: Record<string, string> = {};
        
        for (const part of parts) {
            const trimmedPart = part.trim();
            if (!trimmedPart) continue;

            if (trimmedPart.startsWith('Primary Diagnosis:') || trimmedPart.startsWith('Final Diagnosis:')) {
                const [_, diagnosis] = trimmedPart.split(/Diagnosis:\s*/);
                result.diagnosis = diagnosis?.split('Justification')[0]?.trim() || '';
            }
            
            if (trimmedPart.includes('Justification:')) {
                const justification = trimmedPart.split('Justification:')[1]
                    ?.split('Differential')[0]
                    ?.trim()
                    ?.replace(/_/g, ' ')
                    ?.replace(/exmas\b/g, 'exams')
                    ?.replace(/\s+/g, ' ') || '';
                result.justification = justification;
            }
            
            if (trimmedPart.includes('Differential Diagnoses:')) {
                result.differentials = trimmedPart
                    .split('Differential Diagnoses:')[1]
                    ?.trim() || '';
            }
        }

        return result;
    }
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border space-y-4">
    <!-- Overall Score -->
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Case Feedback</h3>
        <div class="text-xl font-bold {feedback.total_score >= 7 ? 'text-green-500' : feedback.total_score >= 5 ? 'text-yellow-500' : 'text-red-500'}">
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
                    <span class="font-semibold {categoryFeedback.score >= 7 ? 'text-green-500' : categoryFeedback.score >= 5 ? 'text-yellow-500' : 'text-red-500'}">
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

    <!-- Action Analysis -->
    {#if feedback.annotations.length > 0}
        <div class="border-t pt-3">
            <h4 class="font-medium mb-2">Action Analysis</h4>
            <div class="space-y-3">
                {#each feedback.annotations as annotation}
                    <div class="text-sm p-3 rounded-lg bg-muted/50 border">
                        <!-- Action Header -->
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-medium capitalize">{annotation.step.replace('_', ' ')}:</span>
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium
                                    {annotation.relevance === 'relevant' || annotation.correctness === 'correct' 
                                        ? 'bg-green-500/10 text-green-500' 
                                        : annotation.relevance === 'irrelevant' || annotation.correctness === 'incorrect'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-yellow-500/10 text-yellow-500'}">
                                    {annotation.relevance || annotation.correctness || ''}
                                </span>
                            </div>
                        </div>

                        <!-- Action Content -->
                        {#if annotation.step === 'diagnosis' || annotation.step === 'final-diagnosis'}
                            {@const diagnosisData = formatDiagnosisAction(annotation.action)}
                            <div class="space-y-2">
                                {#if diagnosisData.diagnosis}
                                    <div>
                                        <span class="font-medium text-foreground/90">
                                            {annotation.step === 'final-diagnosis' ? 'Final' : 'Primary'} Diagnosis:
                                        </span>
                                        <span class="ml-1">{diagnosisData.diagnosis}</span>
                                    </div>
                                {/if}

                                {#if diagnosisData.justification}
                                    <div>
                                        <span class="font-medium text-foreground/90">Justification:</span>
                                        <div class="ml-1 text-foreground/80 flex flex-wrap gap-1 items-center">
                                            {#each diagnosisData.justification.split('+') as part, i}
                                                {#if i > 0}
                                                    <span class="text-foreground/60">+</span>
                                                {/if}
                                                <span class="px-1.5 py-0.5 bg-muted rounded text-foreground/80">{part.trim()}</span>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}

                                {#if diagnosisData.differentials}
                                    <div>
                                        <span class="font-medium text-foreground/90">Differential Diagnoses:</span>
                                        <ul class="mt-1 ml-4 list-disc space-y-0.5">
                                            {#each diagnosisData.differentials.split(',') as differential}
                                                <li class="text-foreground/80">{differential.trim()}</li>
                                            {/each}
                                        </ul>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <p class="text-sm font-medium text-foreground/90">
                                {annotation.action}
                            </p>
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