<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import MarkdownContent from "$lib/components/MarkdownContent.svelte";
    import { marked } from "marked";
    import {
        caseStore,
        generatePersonaFromUrl,
        type CaseStoreState,
    } from "$lib/stores/caseCreatorStore";
    import { onDestroy, onMount } from "svelte";
    import CoverImage from "$lib/components/CoverImage.svelte";

    // Props
    let {
        open = $bindable(false),
        competencyCode,
        competencyText,
        documents = [],
    } = $props<{
        open: boolean;
        competencyCode: string;
        competencyText: string;
        documents: Array<{
            id: number;
            title: string;
            type: string;
            url: string;
            description: string;
            created_at: string;
            topic_name: string;
        }>;
    }>();
    // Define initialValue based on the expected structure of CaseStoreState
    const initialValue: CaseStoreState = {
        fileUploaded: false,
        generating: false,
        error: null,
        persona: null,
        loading: false,
        testData: {
            physical_exam: null,
            lab_test: null,
        },
        coverImage: null,
        caseId: null,
        differentialDiagnosis: null,
        uploadedFile: null,
        uploadedFileName: null,
        isGeneratingPersona: false,
        isGeneratingPhysicalExam: false,
        isGeneratingDifferential: false,
        isSearchingImages: false,
        searchedImages: null,
    };
    // Local state
    console.log("dialog initialized");
    let title = $state("");
    let currentTab = $state("patient-persona");
    let hasStartedGeneration = $state(false);
    let caseState = $state<CaseStoreState>($caseStore);
    let hasGeneratedOnce = $state(false);
    let selectedDocument = $state<(typeof documents)[0] | null>(null);

    // Subscribe to store with cleanup
    const unsubscribe = caseStore.subscribe((state) => {
        caseState = state;
    });

    // Markdown helper
    function syncMarked(content: string): string {
        return marked.parse(content) as string;
    }

    // Generation logic
    async function generateSequentially() {
        if (!selectedDocument) {
            console.error("No file selected");
            return;
        }

        try {
            await generatePersonaFromUrl(
                selectedDocument.url,
                caseState.caseId ?? "",
            );
            currentTab = "cover-image";
            // await generatePhysicalExamFromUrl(selectedDocument.url, caseState.caseId ?? "");
            // await generateDifferentialDiagnosisFromUrl(selectedDocument.url, caseState.caseId ?? "");
        } catch (error) {
            console.error("Error in sequential generation:", error);
        }
    }

    onDestroy(() => {
        unsubscribe(); // Cleanup subscription when component is destroyed
    });
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[1200px]">
        <Dialog.Header>
            <Dialog.Title>Add Case Assessment ({competencyCode})</Dialog.Title>
            <Dialog.Description>
                Create a new case assessment for {competencyText}
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-6">
            <div class="grid gap-2">
                <label for="title">Title</label>
                <Input id="title" bind:value={title} required />
            </div>

            <div class="grid gap-2">
                <label for="fileSelect">Select Source File</label>
                <select
                    id="fileSelect"
                    bind:value={selectedDocument}
                    class="w-full px-3 py-2 border rounded-md border-input bg-background"
                >
                    <option value={null}>Select a file...</option>
                    {#each documents as doc}
                        <option value={doc}>{doc.title}</option>
                    {/each}
                </select>
            </div>

            <Button
                type="button"
                disabled={!selectedDocument}
                onclick={generateSequentially}
                class="w-full"
            >
                Generate from {selectedDocument
                    ? selectedDocument.title
                    : "Selected File"}
            </Button>

            <Tabs.Root value={currentTab} class="w-full">
                <Tabs.List class="border-b w-full flex justify-start gap-8">
                    <Tabs.Trigger value="patient-persona"
                        >Patient Persona</Tabs.Trigger
                    >
                    <Tabs.Trigger value="cover-image">Cover Image</Tabs.Trigger>

                    <Tabs.Trigger value="physical-exams"
                        >Physical Exams</Tabs.Trigger
                    >
                    <Tabs.Trigger value="differential"
                        >Differential</Tabs.Trigger
                    >
                </Tabs.List>

                <div class="mt-4">
                    <Tabs.Content value="patient-persona">
                        <div class=" max-h-[40vh] overflow-y-auto">
                            {#if caseState.isGeneratingPersona}
                                <LoadingMessage
                                    message="Creating patient persona..."
                                />
                            {:else if caseState.persona}
                                <MarkdownContent
                                    content={syncMarked(
                                        caseState.persona.content,
                                    )}
                                />
                            {:else}
                                <div
                                    class="text-center text-muted-foreground py-8"
                                >
                                    <p>No patient persona generated yet</p>
                                </div>
                            {/if}
                        </div>
                    </Tabs.Content>
                    <Tabs.Content value="cover-image">
                        <div class="max-h-[40vh] overflow-y-auto">
                            {#if currentTab === "cover-image"}
                                <CoverImage />
                            {/if}
                        </div>
                    </Tabs.Content>
                    <Tabs.Content value="physical-exams">
                        <div class="min-h-[200px]">Physical Exams Content</div>
                    </Tabs.Content>

                    <Tabs.Content value="differential">
                        <div class="min-h-[200px]">Differential Content</div>
                    </Tabs.Content>
                </div>
            </Tabs.Root>

            <Dialog.Footer>
                <Dialog.Close>
                    <Button type="button" variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Create Assessment</Button>
            </Dialog.Footer>
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
