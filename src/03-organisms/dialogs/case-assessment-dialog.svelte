<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import { onMount } from "svelte";
    import MarkdownContent from "$lib/components/MarkdownContent.svelte";
    import { marked } from "marked";

    export let open = false;
    export let competencyCode: string;
    export let competencyText: string;
    
    export let onSubmit: (data: any) => void;

    let title = "";
    let currentTab = "patient-persona";
    let error = "";

    // Loading states for each tab
    let isLoadingPersona = false;
    let isLoadingPhysicalExams = false;
    let isLoadingDifferential = false;

    // Generated content states
    let personaContent: string | null = null;
    let physicalExamsContent: string | null = null;
    let differentialDiagnosis: string[] | null = null;

    async function generatePersona() {
        isLoadingPersona = true;
        error = "";
        try {
            // Replace with your actual API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            personaContent = "Generated patient information...";
        } catch (e) {
            error = "Failed to generate patient persona";
        } finally {
            isLoadingPersona = false;
        }
    }

    async function generatePhysicalExams() {
        isLoadingPhysicalExams = true;
        error = "";
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            physicalExamsContent = "Generated physical exams...";
        } catch (e) {
            error = "Failed to generate physical exams";
        } finally {
            isLoadingPhysicalExams = false;
        }
    }

    async function generateDifferential() {
        isLoadingDifferential = true;
        error = "";
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            differentialDiagnosis = [
                "Diagnosis 1",
                "Diagnosis 2",
                "Diagnosis 3",
            ];
        } catch (e) {
            error = "Failed to generate differential diagnosis";
        } finally {
            isLoadingDifferential = false;
        }
    }

    // Auto-generate content when dialog opens
    $: if (open) {
        generatePersona();
        generatePhysicalExams();
        generateDifferential();
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[900px]">
        <Dialog.Header>
            <Dialog.Title class="text-lg font-semibold"
                >Add Case Assessment</Dialog.Title
            >
            <Dialog.Description>Create a new case assessment</Dialog.Description
            >
        </Dialog.Header>

        <form
            on:submit|preventDefault={(e) =>
                onSubmit({
                    title,
                    personaContent,
                    physicalExamsContent,
                    differentialDiagnosis,
                })}
            class="space-y-6"
        >
            <div class="grid gap-2">
                <label for="title">Title</label>
                <Input id="title" bind:value={title} required />
            </div>

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

                <div class="mt-4 h-[calc(100vh-500px)] overflow-y-auto">
                    <Tabs.Content value="patient-persona">
                        {#if isLoadingPersona}
                            <LoadingMessage
                                message="Creating patient persona..."
                            />
                        {:else if error}
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        {:else if personaContent}
                            <div class="rounded-lg pt-4">
                                <div class="flex justify-end mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onclick={generatePersona}
                                    >
                                        Regenerate Patient Persona
                                    </Button>
                                </div>
                                <div class="prose dark:prose-invert">
                                    <MarkdownContent
                                        content={marked(personaContent)}
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
                        {#if isLoadingPhysicalExams}
                            <LoadingMessage
                                message="Generating physical examinations and lab tests..."
                            />
                        {:else if error}
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        {:else if physicalExamsContent}
                            <div class="rounded-lg pt-4">
                                <div class="flex justify-end mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onclick={generatePhysicalExams}
                                    >
                                        Regenerate Physical Exams
                                    </Button>
                                </div>
                                <div class="prose dark:prose-invert">
                                    <MarkdownContent
                                        content={marked(physicalExamsContent)}
                                    />
                                </div>
                            </div>
                        {:else}
                            <div class="text-center text-muted-foreground py-8">
                                <p>Physical exams are not available yet</p>
                            </div>
                        {/if}
                    </Tabs.Content>

                    <Tabs.Content value="differential-diagnosis">
                        {#if isLoadingDifferential}
                            <LoadingMessage
                                message="Generating differential diagnosis..."
                            />
                        {:else if error}
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        {:else if differentialDiagnosis}
                            <div class="rounded-lg pt-4">
                                <div class="flex justify-end mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onclick={generateDifferential}
                                    >
                                        Regenerate Differential Diagnosis
                                    </Button>
                                </div>
                                <ul class="space-y-2">
                                    {#each differentialDiagnosis as diagnosis, index}
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
                                <p>
                                    Differential diagnosis is not available yet
                                </p>
                            </div>
                        {/if}
                    </Tabs.Content>
                </div>
            </Tabs.Root>

            <Dialog.Footer>
                <Dialog.Close>
                    <Button type="button" variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Create Case Assessment</Button>
            </Dialog.Footer>
        </form>
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
