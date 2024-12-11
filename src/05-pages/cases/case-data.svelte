<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import { marked } from "marked";

    interface FormattedResponse {
        id: string;
        content: string;
        timestamp: string;
        type: "ai";
    }
 

    let { uploadState } = $props();
</script>

<Card.Root class="flex-1">
    <Card.Header>
        <Card.Title>Case Data</Card.Title>
        <Card.Description>Upload and analyze patient case documents</Card.Description>
    </Card.Header>
    <Card.Content>
        <Tabs.Root value="patient-persona" class="w-full">
            <Tabs.List class="border-b">
                <Tabs.Trigger value="patient-persona">Patient Persona</Tabs.Trigger>
                <Tabs.Trigger value="physical-exams">Physical Exams</Tabs.Trigger>
                <Tabs.Trigger value="lab-results">Lab Results</Tabs.Trigger>
                <Tabs.Trigger value="case-summary">Case Summary For Feedback</Tabs.Trigger>
         
            </Tabs.List>
            
            <div class="mt-4 h-[calc(100vh-330px)] overflow-y-auto">
                <Tabs.Content value="patient-persona">
                    {#if uploadState.generating}
                        <div class="space-y-4">
                            <LoadingMessage message="Creating patient persona" />
                        </div>
                    {:else if uploadState.error}
                        <Alert variant="destructive">
                            <AlertDescription>
                                {uploadState.error}
                            </AlertDescription>
                        </Alert>
                    {:else if uploadState.response}
                        <div class="rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <time class="text-xs text-muted-foreground">
                                    {new Date(uploadState.response.timestamp).toLocaleString()}
                                </time>
                            </div>
                            <div class="prose prose-sm dark:prose-invert max-w-none">
                                {@html marked(uploadState.response.content)}
                            </div>
                        </div>
                    {:else}
                        <div class="text-center text-muted-foreground py-8">
                            <p>No patient persona generated yet</p>
                        </div>
                    {/if}
                </Tabs.Content>

                <Tabs.Content value="medical-history">
                    <div class="text-center text-muted-foreground py-8">
                        <p>Medical history will be available after analysis</p>
                    </div>
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

                <Tabs.Content value="physical-exams">
                    <div class="text-center text-muted-foreground py-8">
                        <p>Physical exams will be available after analysis</p>
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