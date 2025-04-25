<script lang="ts">
    import type { HistoryFeedbackResponse } from "$lib/services/feedbackService";
    import * as Tooltip from "$lib/components/ui/tooltip";

    export let feedback: HistoryFeedbackResponse;
</script>

<div class="p-4 pl-0 space-y-6">
    <!-- Domain Scores -->
    <div class="space-y-2 mt-6">
        <h3 class="font-semibold text-base mb-6 underline">Score Breakdown</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
            {#each Object.entries(feedback.analysis_result.domain_score_summary) as [domain, data]}
                <Tooltip.Provider>
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <div
                                class="p-4 border rounded-lg bg-white transition-shadow hover:shadow-md cursor-help h-full text-left"
                            >
                                <div
                                    class="flex items-start justify-between gap-2"
                                >
                                    <h4
                                        class="font-medium capitalize flex-1 text-left"
                                    >
                                        {domain.replace(/_/g, " ")}
                                    </h4>
                                    <div
                                        class={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${Number(data.score) >= 2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                    >
                                        {data.score}
                                    </div>
                                </div>
                                <p
                                    class="text-sm text-muted-foreground mt-2 text-left"
                                >
                                    {data.reason_for_score}
                                </p>
                            </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                            class="max-w-xs bg-blue-50 p-3 rounded-md shadow-md text-left"
                        >
                            <div class="font-medium mb-1">for eg.,</div>
                            <p class="italic text-gray-700">
                                {data.example || "No example provided"}
                            </p>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>
            {/each}
        </div>
    </div>
    <!-- Missed Highlights Table -->
    <div class="space-y-2">
        <h3 class="font-semibold text-base mb-6 underline">Missed Questions</h3>
        <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-sm">
                <thead class="bg-red-50 border-b border-red-200">
                    <tr>
                        <th class="p-3 text-left font-medium text-red-800"
                            >Question</th
                        >
                        <th class="p-3 text-left font-medium text-red-800"
                            >Importance</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each feedback.analysis_result.missed_highlights as item, i}
                        <tr class={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td class="p-2">{item.missed_question}</td>
                            <td class="p-2">{item.why_important}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Improvement Highlights Table -->
    {#if feedback.analysis_result.improvement_highlights.length > 0}
        <div class="space-y-2">
            <h3 class="font-semibold text-base mb-6 underline">
                Areas for Improvement
            </h3>
            <div class="border rounded-lg overflow-hidden">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="p-2 text-left font-medium">Area</th>
                            <th class="p-2 text-left font-medium">Suggestion</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each feedback.analysis_result.improvement_highlights as item}
                            <tr class="border-t">
                                <td class="p-2">{item.area}</td>
                                <td class="p-2">{item.suggestion}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>
