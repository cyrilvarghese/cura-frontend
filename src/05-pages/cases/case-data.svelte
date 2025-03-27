<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import { marked } from "marked";
    import MarkdownContent from "$lib/components/MarkdownContent.svelte";
    import type { CaseStoreState } from "$lib/stores/caseCreatorStore";
    import TestDataDisplay from "./TestDataDisplay.svelte";
    import CoverImage from "$lib/components/CoverImage.svelte";
    import { onMount } from "svelte";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Textarea } from "$lib/components/ui/textarea";
    import { phrasesToAvoidStore } from "$lib/stores/phrasesToAvoidStore";
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
            | "differential-diagnosis";
    }>();
    onMount(() => {
        console.log(uploadState.caseId);
    });
    $effect(() => {
        console.log("caseId changed:", uploadState.caseId);
        // Add any additional logic for caseId changes
    });
    // Ensure synchronous markdown conversion
    function syncMarked(content: string): string {
        return marked.parse(content) as string;
    }

    let showCoverImage = $state(false);
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
</script>

<Card.Root class="flex-1">
    <Card.Header>
        <Card.Title class="text-lg font-semibold"
            >Data for case {$lastCaseIdStore}</Card.Title
        >
        <Card.Description
            >Upload and analyze patient case documents</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <Tabs.Root value={currentTab} class="w-full">
            <Tabs.List class="border-b w-full flex justify-start gap-8">
                <Tabs.Trigger value="patient-persona"
                    >Patient Persona</Tabs.Trigger
                >
                <Tabs.Trigger value="physical-exams"
                    >Physical Examination & Lab Tests</Tabs.Trigger
                >
                <Tabs.Trigger value="differential-diagnosis"
                    >Differential Diagnosis</Tabs.Trigger
                >
            </Tabs.List>

            <div class="mt-4 h-[calc(100vh-404px)] overflow-y-auto">
                <Tabs.Content value="patient-persona">
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
                            <div class="flex justify-start mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onclick={() => (showPhraseDialog = true)}
                                >
                                    Add phrases to avoid
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

                            <div class="mb-4">
                                <div class="mt-4">
                                    <CoverImage caseId={uploadState.caseId} />
                                </div>
                            </div>
                        </div>
                        <div class="rounded-lg pt-4">
                            <MarkdownContent
                                content={syncMarked(
                                    uploadState.persona.content,
                                )}
                            />
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
                    {:else if uploadState.differentialDiagnosis}
                        <div class="rounded-lg pt-4">
                            <ul class="space-y-2">
                                {#each uploadState.differentialDiagnosis as diagnosis, index}
                                    <li
                                        class="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Differential diagnosis is not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>
            </div>
        </Tabs.Root>
    </Card.Content>
</Card.Root>

<Dialog.Root bind:open={showPhraseDialog}>
    <Dialog.Content class="sm:max-w-[425px]">
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
