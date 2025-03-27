<script lang="ts">
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { MoreVertical, Upload, FileIcon, X } from "lucide-svelte";
    import {
        curriculumStore,
        fetchCurriculumData,
    } from "$lib/stores/curriculumStore";
    import { documentStore, uploadDocument } from "$lib/stores/documentStore";
    import { onMount } from "svelte";
    import PageLayout from "../04-templates/page-layout.svelte";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import DocumentUploadButton from "$lib/components/DocumentUploadButton.svelte";
    import { API_BASE_URL } from "$lib/config/api";
    import AssessmentButton from "$lib/components/AssessmentButton.svelte";
    import AssessmentPill from "$lib/components/AssessmentPill.svelte";

    let searchQuery = $state("");
    let uploadError = $state("");
    let showAlert = $state(false);

    onMount(() => {
        fetchCurriculumData();
    });

    const filteredTopics = $derived(
        $curriculumStore?.topics
            ?.map((topic) => ({
                ...topic,
                documents: [
                    ...(topic.documents || []),
                    ...($documentStore.documents[topic.topic] || []),
                ].filter(
                    (doc, index, self) =>
                        index === self.findIndex((d) => d.id === doc.id),
                ),
            }))
            .filter((topic) => {
                // Only show topics that have competencies
                if (!topic.competencies.length) return false;

                // If no search query, show all topics
                if (!searchQuery) return true;

                const query = searchQuery.toLowerCase();
                return (
                    // Search in topic name
                    topic.topic.toLowerCase().includes(query) ||
                    // Search in competencies - match individual words
                    topic.competencies.some((comp) => {
                        const words = query
                            .split(" ")
                            .filter((word) => word.length > 0);
                        return words.every(
                            (word) =>
                                comp.competency.toLowerCase().includes(word) ||
                                comp.competency_code
                                    .toLowerCase()
                                    .includes(word),
                        );
                    })
                );
            }) ?? [],
    );
</script>

<PageLayout
    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Curriculum" }]}
>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">
            {$curriculumStore?.department ?? "Loading..."}
        </h1>
        <div class="relative">
            <input
                type="search"
                placeholder="Search..."
                bind:value={searchQuery}
                style="background-color: #eff6ff;"
                class="px-4 py-2 border bg-blue-50! rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    {#if $curriculumStore}
        {#each filteredTopics as topic}
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold">{topic.topic}</h2>
                    <div class="flex items-center gap-4">
                        {#if topic.documents?.length > 0}
                            <div class="flex gap-2 flex-wrap">
                                {#each topic.documents as doc}
                                    <a
                                        href={`${API_BASE_URL}${doc.url}`}
                                        class="inline-flex items-center gap-2 px-3 py-1 text-sm bg-muted rounded-full hover:bg-muted/80"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FileIcon class="h-4 w-4" />
                                        <span>{doc.title}</span>
                                    </a>
                                {/each}
                            </div>
                        {/if}
                        <DocumentUploadButton topicName={topic.topic} />
                    </div>
                </div>
                <div class="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow class="bg-muted/50 text-muted-foreground">
                                <TableHead class="w-[100px]">Code</TableHead>
                                <TableHead class="w-[400px]"
                                    >Competency</TableHead
                                >
                                <TableHead class="w-[200px]">Teaching</TableHead
                                >
                                <TableHead class="w-[300px]"
                                    >Assessment</TableHead
                                >
                                <TableHead class="w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each topic.competencies as competency}
                                <TableRow>
                                    <TableCell
                                        >{competency.competency_code}</TableCell
                                    >
                                    <TableCell
                                        >{competency.competency}</TableCell
                                    >
                                    <TableCell>
                                        <div class="flex gap-2 flex-wrap">
                                            {#each competency.teaching_methods as method}
                                                <span
                                                    class="text-sm bg-gray-100 px-2 py-1 rounded"
                                                    >{method}</span
                                                >
                                            {/each}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex gap-2 flex-wrap">
                                            {#if competency.assessments.length > 0}
                                                {#each competency.assessments as assessment}
                                                    <AssessmentPill {assessment}   onDelete={(id) => fetchCurriculumData()}  />
                                                {/each}
                                            {:else}
                                                <span
                                                    class="text-sm text-red-500"
                                                    >No assessment added</span
                                                >
                                            {/if}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex gap-2">
                                            <AssessmentButton
                                                competencyText={competency.competency}
                                                competencyCode={competency.competency_code}
                                                documents={topic.documents}
                                                disabled={!topic.documents
                                                    ?.length}
                                                topic={topic.topic}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                class="h-8 w-8"
                                            >
                                                <MoreVertical class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            </div>
        {/each}
    {:else}
        <div class="flex justify-center items-center h-64">
            <div class="text-xl text-gray-500">Loading curriculum data...</div>
        </div>
    {/if}

    {#if showAlert}
        <Alert
            variant="destructive"
            class="fixed top-4 right-4 w-auto bg-red-50/80 backdrop-blur-sm border border-red-200 shadow-lg animate-in slide-in-from-top-5"
        >
            <AlertDescription class="text-red-600"
                >{uploadError}</AlertDescription
            >
        </Alert>
    {/if}
</PageLayout>
