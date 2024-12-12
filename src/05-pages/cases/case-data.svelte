<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import { marked } from "marked";
    import MarkdownContent from "$lib/components/MarkdownContent.svelte";
    import type { CaseStoreState } from "$lib/stores/caseStore";
    import TestDataDisplay from "./TestDataDisplay.svelte";

    // Use $props() to declare props in runes mode
    const { uploadState, currentTab } = $props<{ 
        uploadState: CaseStoreState; 
        currentTab: 'patient-persona'|'physical-exams'|'lab-results'|'case-summary'; 
    }>();

    $effect(() => {
        console.log("uploadState", uploadState);
        console.log("currentTab", currentTab);
    });
    
    

    // Ensure synchronous markdown conversion
    function syncMarked(content: string): string {
        return marked.parse(content) as string;
    } 
</script>

<Card.Root class="flex-1">
    
    <Card.Header>
        <Card.Title class="text-lg font-semibold">Case Data</Card.Title>
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
                    >Physical Exams</Tabs.Trigger
                >
                <Tabs.Trigger value="lab-results">Lab Results</Tabs.Trigger>
                <Tabs.Trigger value="case-summary"
                    >Case Summary For Feedback</Tabs.Trigger
                >
            </Tabs.List>

            <div class="mt-4 h-[calc(100vh-354px)] overflow-y-auto">
                <Tabs.Content value="patient-persona">
                    {#if uploadState.generating}
                        <LoadingMessage message="Creating patient persona" />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.persona}
                        <div class="rounded-lg">
                            <time
                                class="text-xs text-muted-foreground mb-2 block"
                            >
                                {new Date(
                                    uploadState.persona.timestamp,
                                ).toLocaleString()}
                            </time>

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
                    {#if uploadState.generating}
                        <LoadingMessage message="Getting physical exams" />
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.testData}
                        <TestDataDisplay testData={uploadState.testData} />
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>Physical exams are not available yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="lab-results">
                    <div class="text-center text-muted-foreground py-8">
                        <p>Lab results will be available after analysis</p>
                    </div>
                </Tabs.Content>

                <Tabs.Content value="case-summary">
                    <div class="text-center text-muted-foreground py-8">
                        <p>Case summary will be available after analysis</p>
                    </div>
                </Tabs.Content>

                 
            </div>
        </Tabs.Root>
    </Card.Content>
</Card.Root>

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
