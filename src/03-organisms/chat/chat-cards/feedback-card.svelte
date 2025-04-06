<script lang="ts">
    import type { FeedbackCategory, FeedbackResponse } from "$lib/types";
    import Star from "lucide-svelte/icons/star";
    import StarHalf from "lucide-svelte/icons/star-half";
    import StarOff from "lucide-svelte/icons/star-off";
    import * as HoverCard from "$lib/components/ui/hover-card";
    import * as Accordion from "$lib/components/ui/accordion";
    import { ExternalLink } from "lucide-svelte";
    import DrugDialog from "./drug-dialog.svelte";
    import TestDialog from "./test-dialog.svelte";

    export let feedback: FeedbackResponse;
    import { onMount } from "svelte";

    // Scoring color configuration
    const scoreColors = {
        high: "text-green-400",
        medium: "text-yellow-400",
        low: "text-red-400",
        empty: "text-gray-200",
    } as const;

    function getScoreColor(score: number) {
        if (score >= 7) return scoreColors.high;
        if (score >= 5) return scoreColors.medium;
        return scoreColors.low;
    }

    function getStars(score: number) {
        const stars = [];
        const fullStars = Math.floor(score / 2);
        const hasHalfStar = score % 2 >= 1;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push("full");
        }
        // Add half star if needed
        if (hasHalfStar) {
            stars.push("half");
        }
        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars.push("empty");
        }

        return stars;
    }

    onMount(() => {
        console.log("Feedback received:", feedback);
    });

    const feedbackCategories = [
        { key: "history_taking", label: "History Taking" },
        { key: "examinations_performed", label: "Examinations" },
        { key: "tests_ordered", label: "Tests Ordered" },
        { key: "diagnostic_reasoning", label: "Diagnostic Reasoning" },
        { key: "synthesis_organization", label: "Synthesis & Organization" },
        {
            key: "pre_treatment_investigations",
            label: "Pre-treatment Investigations",
        },
        { key: "prescription_writing", label: "Prescription Writing" },
        {
            key: "post_treatment_monitoring",
            label: "Post-treatment Monitoring",
        },
    ] as const;

    export function formatDiagnosis(diagnosisText: string) {
        // Remove duplicate labels that might appear in the text
        const cleanedText = diagnosisText
            .replace(
                /Primary Diagnosis:\s*Primary Diagnosis:/i,
                "Primary Diagnosis:",
            )
            .replace(
                /Final Diagnosis:\s*Primary Diagnosis:/i,
                "Final Diagnosis:",
            )
            .replace(
                /Differential Diagnoses:\s*Differential Diagnoses:/i,
                "Differential Diagnoses:",
            );

        // Split the text into three main sections: primary diagnosis, justification, and differential diagnoses
        const [primary, justification, differential] = cleanedText
            .split(/(?:Justification:|Differential Diagnoses:)/)
            .map((s) => s.trim());

        // Extract justification text using regex with lookahead to find text between sections
        const justificationText =
            diagnosisText
                .match(/Justification:(.*?)(?=Differential Diagnoses:|$)/s)?.[1]
                ?.trim() || "";

        return {
            primaryDiagnosis: primary
                .replace(/(?:Primary|Final) Diagnosis:/, "")
                .trim(),
            justification: justificationText,
            differentialDiagnoses: differential
                ? differential
                      .split(",")
                      .map((d) => d.trim())
                      .filter(Boolean) // Split by comma and remove empty entries
                : [],
        };
    }

    // Helper function to determine if feedback category has table data
    function hasTableData(category: string) {
        return [
            "pre_treatment_investigations",
            "post_treatment_monitoring",
        ].includes(category);
    }

    // Update helper function to check for medication sections only
    function hasMedicationSections(category: string) {
        return category === "prescription_writing";
    }

    function hasTableFormat(category: FeedbackCategory) {
        return category.missed?.table_headers !== undefined;
    }

    function isPrescriptionSection(category: string) {
        return category === "prescription_writing";
    }

    let selectedDrug = "";
    let isDrugDialogOpen = false;

    function openDrugDialog(drug: string) {
        selectedDrug = drug;
        isDrugDialogOpen = true;
    }

    let selectedTest = "";
    let isTestDialogOpen = false;

    function openTestDialog(test: string) {
        selectedTest = test;
        isTestDialogOpen = true;
    }
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border space-y-4">
    <!-- Overall Score -->
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Case Feedback</h3>
        <div class="flex items-center gap-2">
            <div
                class="text-lg font-bold {getScoreColor(feedback.total_score)}"
            >
                {feedback.total_score.toFixed(1)}/10
            </div>
            <div class="flex gap-0.5">
                {#each getStars(feedback.total_score) as starType}
                    {#if starType === "full"}
                        <Star
                            class="w-4 h-4 fill-current {getScoreColor(
                                feedback.total_score,
                            )}"
                        />
                    {:else if starType === "half"}
                        <StarHalf
                            class="w-4 h-4 fill-current {getScoreColor(
                                feedback.total_score,
                            )}"
                        />
                    {:else}
                        <StarOff class="w-4 h-4 {scoreColors.empty}" />
                    {/if}
                {/each}
            </div>
        </div>
    </div>

    <!-- Convert categories to accordion -->
    <Accordion.Root class="space-y-2" type="single">
        {#each feedbackCategories as category}
            {@const categoryFeedback = feedback.feedback[category.key]}

            <Accordion.Item value={category.key}>
                <Accordion.Trigger
                    class="flex w-full items-center justify-between py-2"
                >
                    <div class="flex items-center justify-between w-full">
                        <h4 class="font-medium">{category.label}</h4>
                        <div class="flex gap-0.5">
                            {#each getStars(categoryFeedback.score) as starType}
                                {#if starType === "full"}
                                    <Star
                                        class="w-3.5 h-3.5 fill-current {getScoreColor(
                                            categoryFeedback.score,
                                        )}"
                                    />
                                {:else if starType === "half"}
                                    <StarHalf
                                        class="w-3.5 h-3.5 fill-current {getScoreColor(
                                            categoryFeedback.score,
                                        )}"
                                    />
                                {:else}
                                    <StarOff
                                        class="w-3.5 h-3.5 {scoreColors.empty}"
                                    />
                                {/if}
                            {/each}
                        </div>
                    </div>
                </Accordion.Trigger>
                <Accordion.Content>
                    <div class="pt-2">
                        <div class="space-y-4">
                            <p class="text-sm text-muted-foreground">
                                {categoryFeedback.comments}
                            </p>

                            <!-- Prescription Sections -->
                            {#if isPrescriptionSection(category.key) && categoryFeedback.missed?.sections}
                                {#each categoryFeedback.missed.sections as section}
                                    <div class="space-y-3">
                                        <h5 class="font-medium text-sm">
                                            {#if section.title.includes("🟢")}
                                                <span class="text-green-500"
                                                    >{section.title}</span
                                                >
                                            {:else if section.title.includes("🟡")}
                                                <span class="text-yellow-500"
                                                    >{section.title}</span
                                                >
                                            {:else if section.title.includes("🔴")}
                                                <span class="text-red-500"
                                                    >{section.title}</span
                                                >
                                            {:else}
                                                {section.title}
                                            {/if}
                                        </h5>
                                        <div
                                            class="overflow-x-auto border rounded-lg"
                                        >
                                            <table
                                                class="w-full text-sm table-fixed"
                                            >
                                                <thead>
                                                    <tr>
                                                        {#if categoryFeedback.missed.table_headers}
                                                            {#each categoryFeedback.missed.table_headers as header}
                                                                <th
                                                                    class="text-left p-2 border-b bg-muted font-medium whitespace-nowrap"
                                                                    >{header}</th
                                                                >
                                                            {/each}
                                                        {/if}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {#each section.rows as row}
                                                        <tr
                                                            class="border-b last:border-0 hover:bg-muted/50"
                                                        >
                                                            {#each row as cell, cellIndex}
                                                                <td
                                                                    class="p-2 text-muted-foreground"
                                                                >
                                                                    {#if cellIndex === 0}
                                                                        <!-- First column is drug name - Updated styling -->
                                                                        <button
                                                                            class="text-blue-600 hover:text-blue-800 underline decoration-blue-400/50 hover:decoration-blue-600 decoration-2 text-left font-medium transition-colors"
                                                                            on:click={() =>
                                                                                openDrugDialog(
                                                                                    cell,
                                                                                )}
                                                                        >
                                                                            {cell}
                                                                        </button>
                                                                    {:else}
                                                                        {cell}
                                                                    {/if}
                                                                </td>
                                                            {/each}
                                                        </tr>
                                                    {/each}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                {/each}

                                {#if categoryFeedback.missed.tips}
                                    <div
                                        class="mt-4 p-4 bg-muted/30 rounded-lg"
                                    >
                                        <h6 class="font-medium text-sm mb-2">
                                            💡 Tips:
                                        </h6>
                                        <ul
                                            class="list-disc pl-4 text-sm text-muted-foreground space-y-1"
                                        >
                                            {#each categoryFeedback.missed.tips as tip}
                                                <li>{tip}</li>
                                            {/each}
                                        </ul>
                                    </div>
                                {/if}

                                <!-- Table Format -->
                            {:else}
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm">
                                        <thead>
                                            <tr>
                                                {#each categoryFeedback.missed.table_headers || ["What was missed", "Why it's relevant"] as header}
                                                    <th
                                                        class="text-left p-2 border-b font-medium"
                                                        >{header}</th
                                                    >
                                                {/each}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#if hasTableFormat(categoryFeedback) && categoryFeedback.missed.rows}
                                                {#each categoryFeedback.missed.rows as row}
                                                    <tr
                                                        class="border-b last:border-0"
                                                    >
                                                        {#each row as cell}
                                                            <td
                                                                class="p-2 text-muted-foreground"
                                                                >{cell}</td
                                                            >
                                                        {/each}
                                                    </tr>
                                                {/each}
                                            {:else}
                                                {#each Object.entries(categoryFeedback.missed) as [key, value], i}
                                                    <tr
                                                        class="border-b last:border-0"
                                                    >
                                                        <td
                                                            class="p-2 text-muted-foreground"
                                                            >{value}</td
                                                        >
                                                        <td
                                                            class="p-2 text-muted-foreground"
                                                            >{categoryFeedback
                                                                .relevance[
                                                                i
                                                            ]}</td
                                                        >
                                                    </tr>
                                                {/each}
                                            {/if}
                                        </tbody>
                                    </table>
                                </div>
                            {/if}

                            <!-- Read more link -->
                            <a
                                href={categoryFeedback.readMore}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                Read more
                                <ExternalLink class="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        {/each}
    </Accordion.Root>

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
                            {@const diagnosisData = formatDiagnosis(
                                annotation.action,
                            )}
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
                                        >
                                            {diagnosisData.justification}
                                        </div>
                                    </div>
                                {/if}

                                {#if diagnosisData.differentialDiagnoses}
                                    <div>
                                        <span
                                            class="font-medium text-foreground/90"
                                            >Differential Diagnoses:</span
                                        >
                                        <ul
                                            class="ml-4 mt-1 list-disc space-y-1"
                                        >
                                            {#each diagnosisData.differentialDiagnoses as differential}
                                                <li class="text-foreground/80">
                                                    {differential}
                                                </li>
                                            {/each}
                                        </ul>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <!-- Display other actions (tests/examinations) as a bulleted list -->
                            <ul class="ml-4 list-disc space-y-1">
                                {#each annotation.action
                                    .split("\n")
                                    .filter(Boolean) as item}
                                    <li class="text-sm text-foreground/80">
                                        <!-- Remove redundant 'Test:' or 'Examination:' prefixes from each item -->
                                        {item.replace(
                                            /^(Test|Examination):\s*/i,
                                            "",
                                        )}
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

<DrugDialog drugName={selectedDrug} bind:isOpen={isDrugDialogOpen} />
<TestDialog testName={selectedTest} bind:isOpen={isTestDialogOpen} />

<style>
    /* Fixed column widths */
    :global(th:nth-child(1)),
    :global(td:nth-child(1)) {
        /* Drug */
        width: 30%;
        min-width: 200px;
    }
    :global(th:nth-child(2)),
    :global(td:nth-child(2)) {
        /* Dose */
        width: 15%;
        min-width: 120px;
    }
    :global(th:nth-child(3)),
    :global(td:nth-child(3)) {
        /* Route */
        width: 10%;
        min-width: 80px;
    }
    :global(th:nth-child(4)),
    :global(td:nth-child(4)) {
        /* Frequency */
        width: 15%;
        min-width: 100px;
    }
    :global(th:nth-child(5)),
    :global(td:nth-child(5)) {
        /* Notes */
        width: 40%;
        min-width: 200px;
    }
</style>
