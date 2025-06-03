<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import { marked } from "marked";
    import MarkdownContent from "$lib/components/MarkdownContent.svelte";
    import type { CaseStoreState } from "$lib/types/caseTypes";
    import TestDataDisplay from "./TestDataDisplay.svelte";
    import CoverImage from "$lib/components/CoverImage.svelte";
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Textarea } from "$lib/components/ui/textarea";
    import { phrasesToAvoidStore } from "$lib/stores/phrasesToAvoidStore";
    import { List, Maximize2, User, X } from "lucide-svelte";
    import HistorySummary from "$lib/components/HistorySummary.svelte";
    import TreatmentContext from "$lib/components/TreatmentContext.svelte";
    import ClinicalFindings from "$lib/components/ClinicalFindings.svelte";
    import DiagnosisContext from "$lib/components/DiagnosisContext.svelte";

    // Use $props() to declare props in runes mode
    const { uploadState, currentTab } = $props<{
        uploadState: CaseStoreState;
        currentTab:
            | "patient-persona"
            | "physical-exams"
            | "lab-results"
            | "case-summary"
            | "cover-image"
            | "examination-editor"
            | "differential-diagnosis"
            | "history-summary"
            | "treatment-context"
            | "clinical-findings-context";
    }>();
    onMount(() => {
        console.log(uploadState.caseId);
        showCoverImageSection = false;
    });
    $effect(() => {
        console.log("caseId changed:", uploadState.caseId);
        // Add any additional logic for caseId changes
    });
    // Ensure synchronous markdown conversion
    function syncMarked(content: string): string {
        return marked.parse(content) as string;
    }

    let showPhraseDialog = $state(false);
    let newPhrase = $state("");

    async function addPhrase() {
        if (newPhrase.trim()) {
            await phrasesToAvoidStore.addPhrase(
                uploadState.caseId,
                newPhrase.trim(),
            );
            newPhrase = "";
            showPhraseDialog = false;
        }
    }

    // Add state for modal
    let isFullscreen = $state(false);
    let activeTabContent = $state<string | null>(null);

    function openFullscreen(tab: string) {
        activeTabContent = tab;
        isFullscreen = true;
    }

    let showCoverImageSection = $state(false);

    $effect(() => {
        if (uploadState.coverImage?.image_url) {
            showCoverImageSection = true;
        }
    });
</script>

<Card.Root class="flex-1 rounded-none border-none">
    <Card.Content>
        <Tabs.Root value={currentTab} class="w-full">
            <Tabs.List
                class="border-b w-full flex justify-start flex-wrap gap-x-10 gap-y-2 pb-2 h-[100px]"
            >
                <div class="flex items-center gap-2 w-[190px]">
                    <Tabs.Trigger
                        class="hover:underline hover:text-blue-500"
                        value="patient-persona"
                    >
                        Patient Persona
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => openFullscreen("patient-persona")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
                <div class="flex items-center gap-2 w-[280px]">
                    <Tabs.Trigger
                        value="physical-exams"
                        class="hover:underline hover:text-blue-500"
                    >
                        Physical Examination & Lab Tests
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => openFullscreen("physical-exams")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
                <div class="flex items-center gap-2">
                    <Tabs.Trigger
                        class="hover:underline hover:text-blue-500"
                        value="differential-diagnosis"
                    >
                        Differential Diagnosis
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => openFullscreen("differential-diagnosis")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
                <div class="flex items-center gap-2">
                    <Tabs.Trigger
                        class="hover:underline hover:text-blue-500"
                        value="history-summary"
                    >
                        History Summary
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => openFullscreen("history-summary")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
                <div class="flex items-center gap-2 w-[190px]">
                    <Tabs.Trigger
                        class="hover:underline hover:text-blue-500"
                        value="treatment-context"
                    >
                        Treatment Context
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() => openFullscreen("treatment-context")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
                <div class="flex items-center gap-2">
                    <Tabs.Trigger
                        class="hover:underline hover:text-blue-500"
                        value="clinical-findings-context"
                    >
                        Clinical Findings
                    </Tabs.Trigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={() =>
                            openFullscreen("clinical-findings-context")}
                    >
                        <Maximize2 class="h-4 w-4" />
                    </Button>
                </div>
            </Tabs.List>

            <div
                class="mt-4 h-[calc(100vh-350px)] overflow-y-auto bg-muted/50 rounded-xl p-6"
            >
                <Tabs.Content value="patient-persona">
                    <!-- Cover Image Section -->
                    <div class="mb-6">
                        <h2
                            class="text-2xl mb-6 font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center gap-2"
                        >
                            <User class="h-6 w-6 text-primary" />
                            Patient Persona
                        </h2>
                        <div class="flex items-center gap-2 mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onclick={() =>
                                    (showCoverImageSection =
                                        !showCoverImageSection)}
                            >
                                Generate Cover Image
                            </Button>
                        </div>

                        {#if showCoverImageSection}
                            <div class="mt-4">
                                <CoverImage
                                    caseId={uploadState.caseId}
                                    prompt={uploadState.coverImage?.prompt}
                                    imageUrl={uploadState.coverImage?.image_url}
                                    title={uploadState.coverImage?.title}
                                    quote={uploadState.coverImage?.quote}
                                />
                            </div>
                        {/if}
                    </div>

                    {#if uploadState.isGeneratingPersona}
                        <LoadingMessage message="Creating patient persona" />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.persona}
                        <div class="relative">
                            <div class="flex justify-start gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onclick={() => (showPhraseDialog = true)}
                                >
                                    Add phrases to avoid
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    href="/case-library/{uploadState.caseId}"
                                >
                                    Test Patient Dialogue
                                </Button>
                            </div>

                            {#if $phrasesToAvoidStore.isLoading}
                                <div class="text-sm text-muted-foreground">
                                    Adding phrase...
                                </div>
                            {/if}

                            {#if $phrasesToAvoidStore.error}
                                <Alert variant="destructive" class="mb-4">
                                    <AlertDescription>
                                        {$phrasesToAvoidStore.error}
                                    </AlertDescription>
                                </Alert>
                            {/if}

                            {#if $phrasesToAvoidStore.phrases.length > 0}
                                <ul class="mb-4 text-sm">
                                    {#each $phrasesToAvoidStore.phrases as phrase}
                                        <li class="flex items-center space-x-2">
                                            <span
                                                class="size-1.5 rounded-full bg-muted-foreground/20"
                                            ></span>
                                            <span class="text-foreground"
                                                >{phrase}</span
                                            >
                                        </li>
                                    {/each}
                                </ul>
                            {/if}

                            <div class="rounded-lg pt-4">
                                <MarkdownContent
                                    content={syncMarked(
                                        uploadState.persona.content,
                                    )}
                                />
                            </div>
                        </div>
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>No patient persona generated yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="physical-exams">
                    {#if uploadState.isGeneratingPhysicalExam}
                        <LoadingMessage
                            message="Generating physical examinations and lab tests"
                        />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.testData}
                        <TestDataDisplay
                            testData={uploadState.testData}
                            caseId={uploadState.caseId}
                        />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Physical exams are not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="differential-diagnosis">
                    {#if uploadState.isGeneratingDifferential}
                        <LoadingMessage
                            message="Generating differential diagnosis"
                        />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.diagnosisContext}
                        <DiagnosisContext
                            diagnosisContext={uploadState.diagnosisContext}
                        />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Differential diagnosis is not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="history-summary">
                    {#if uploadState.isGeneratingHistoryContext}
                        <LoadingMessage
                            message="Generating case history summary"
                        />
                    {:else if uploadState.error}
                        {@debug uploadState}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.historyContext}
                        <HistorySummary
                            historyContext={uploadState.historyContext}
                        />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Case history summary is not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="treatment-context">
                    {#if uploadState.isGeneratingTreatmentContext}
                        <LoadingMessage
                            message="Generating treatment context"
                        />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.treatmentContext}
                        <TreatmentContext
                            treatmentContext={uploadState.treatmentContext}
                        />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Treatment context is not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="clinical-findings-context">
                    {#if uploadState.isGeneratingClinicalFindingsContext}
                        <LoadingMessage
                            message="Generating clinical findings context"
                        />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.clinicalFindingsContext}
                        <ClinicalFindings
                            clinicalFindingsContext={uploadState.clinicalFindingsContext}
                        />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>
                                Clinical findings context is not available yet
                            </p>
                        </div>
                    {/if}
                </Tabs.Content>
            </div>
        </Tabs.Root>
    </Card.Content>
</Card.Root>

<Dialog.Root bind:open={showPhraseDialog}>
    <Dialog.Overlay class="z-[100]" />

    <Dialog.Content class="sm:max-w-[425px] z-[101]">
        <Dialog.Header>
            <Dialog.Title>Add phrase to avoid</Dialog.Title>
            <Dialog.Description>
                Enter a phrase that should be avoided in the case description.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <Textarea
                placeholder="Enter phrase to avoid..."
                bind:value={newPhrase}
                class="resize-none"
                rows={1}
            />
        </div>
        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => (showPhraseDialog = false)}
            >
                Cancel
            </Button>
            <Button onclick={addPhrase}>Add phrase</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Fullscreen Dialog -->
<Dialog.Root bind:open={isFullscreen}>
    <Dialog.Content class="max-w-[95vw] max-h-[95vh] w-full h-full">
        <div class="flex justify-between items-center mb-4">
            <Dialog.Title>
                {#if activeTabContent === "patient-persona"}
                    Patient Persona
                {:else if activeTabContent === "physical-exams"}
                    Physical Examination & Lab Tests
                {:else if activeTabContent === "differential-diagnosis"}
                    Differential Diagnosis
                {:else if activeTabContent === "history-summary"}
                    History Summary
                {:else if activeTabContent === "treatment-context"}
                    Treatment Context
                {:else if activeTabContent === "clinical-findings-context"}
                    Clinical Findings Context
                {/if}
            </Dialog.Title>
        </div>

        <div class="overflow-y-auto h-[calc(100vh-10rem)]">
            {#if activeTabContent === "patient-persona"}
                <!-- Patient Persona Content -->
                {#if uploadState.isGeneratingPersona}
                    <LoadingMessage message="Creating patient persona" />
                {:else if uploadState.error}
                    <Alert variant="destructive">
                        <AlertDescription>
                            {uploadState.error}
                        </AlertDescription>
                    </Alert>
                {:else if uploadState.persona}
                    <div class="flex justify-start gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onclick={() => (showPhraseDialog = true)}
                        >
                            Add phrases to avoid
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            href="/case-library/{uploadState.caseId}"
                        >
                            Test Patient Dialogue
                        </Button>
                    </div>
                    {#if $phrasesToAvoidStore.isLoading}
                        <div class="text-sm text-muted-foreground">
                            Adding phrase...
                        </div>
                    {/if}

                    {#if $phrasesToAvoidStore.error}
                        <Alert variant="destructive" class="mb-4">
                            <AlertDescription>
                                {$phrasesToAvoidStore.error}
                            </AlertDescription>
                        </Alert>
                    {/if}

                    {#if $phrasesToAvoidStore.phrases.length > 0}
                        <ul class="mb-4 text-sm">
                            {#each $phrasesToAvoidStore.phrases as phrase}
                                <li class="flex items-center space-x-2">
                                    <span
                                        class="size-1.5 rounded-full bg-muted-foreground/20"
                                    ></span>
                                    <span class="text-foreground">{phrase}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    {/if}

                    <div class="rounded-lg pt-4">
                        <MarkdownContent
                            content={syncMarked(uploadState.persona.content)}
                        />
                    </div>
                {/if}
            {:else if activeTabContent === "physical-exams"}
                <!-- Physical Exams Content -->
                {#if uploadState.testData}
                    <TestDataDisplay
                        testData={uploadState.testData}
                        caseId={uploadState.caseId}
                    />
                {/if}
            {:else if activeTabContent === "differential-diagnosis"}
                <!-- Differential Diagnosis Content -->
                {#if uploadState.diagnosisContext}
                    <DiagnosisContext
                        diagnosisContext={uploadState.diagnosisContext}
                    />
                {:else if uploadState.differentialDiagnosis}
                    <div class="rounded-lg pt-4">
                        <ul class="space-y-2">
                            {#each uploadState.differentialDiagnosis as diagnosis, index}
                                <li
                                    class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                                >
                                    <span
                                        class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium mr-3"
                                    >
                                        {index + 1}
                                    </span>
                                    <span
                                        class="text-gray-700 dark:text-gray-200"
                                        >{diagnosis}</span
                                    >
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            {:else if activeTabContent === "history-summary"}
                <!-- History Summary Content -->
                {#if uploadState.historyContext && Object.keys(uploadState.historyContext.content || {}).length > 0}
                    <HistorySummary
                        historyContext={uploadState.historyContext}
                    />
                {:else}
                    <div class="text-center text-muted-foreground py-8">
                        <p>Case history summary is not available yet</p>
                    </div>
                {/if}
            {:else if activeTabContent === "treatment-context"}
                <!-- Treatment Context Content -->
                {#if uploadState.treatmentContext}
                    <TreatmentContext
                        treatmentContext={uploadState.treatmentContext}
                    />
                {/if}
            {:else if activeTabContent === "clinical-findings-context"}
                <!-- Clinical Findings Context Content -->
                {@debug uploadState}
                {#if uploadState.clinicalFindingsContext}
                    <div class="rounded-lg pt-4">
                        <ClinicalFindings
                            clinicalFindingsContext={uploadState.clinicalFindingsContext}
                        />
                    </div>
                {/if}
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>

<style>
    :global(.prose) {
        max-width: none;
    }
    :global(.prose p) {
        margin-top: 1em;
        margin-bottom: 1em;
    }
    :global(.prose ul) {
        list-style-type: disc;
        padding-left: 1.5em;
    }
    :global(.prose ol) {
        list-style-type: decimal;
        padding-left: 1.5em;
    }
</style>
