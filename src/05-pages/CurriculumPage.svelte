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
    import { MoreVertical } from "lucide-svelte";
    import {
        curriculumStore,
        fetchCurriculumData,
    } from "$lib/stores/curriculumStore";
    import { onMount } from "svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import PageLayout from "../04-templates/page-layout.svelte";

    onMount(() => {
        fetchCurriculumData();
    });

    let searchQuery = "";

    $: filteredTopics =
        $curriculumStore?.topics
            .map((topic) => ({
                title: topic.topic,
                items: topic.competencies.map((comp) => ({
                    number: comp.number,
                    competency: comp.competency,
                    teaching: comp.teaching_methods,
                    assessmentMethod: comp.assessment_methods,
                })),
            }))
            .filter((topic) => topic.items.length > 0) ?? [];
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
                value={searchQuery}
                on:input={(e) => (searchQuery = e.currentTarget.value)}
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    {#if $curriculumStore}
        {#each filteredTopics as topic}
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">{topic.title}</h2>
                <div class="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow class="bg-muted/50 text-muted-foreground">
                                <TableHead class="w-[100px]">Number</TableHead>
                                <TableHead class="w-[400px] "
                                    >Competency</TableHead
                                >
                                <TableHead class="w-[200px]">Teaching</TableHead
                                >
                                <TableHead class="w-[300px]"
                                    >Assessment Method</TableHead
                                >
                                <TableHead class="w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each topic.items as item}
                                <TableRow>
                                    <TableCell>{item.number}</TableCell>
                                    <TableCell>{item.competency}</TableCell>
                                    <TableCell>
                                        <div class="flex gap-2 flex-wrap">
                                            {#each item.teaching as method}
                                                <span
                                                    class="text-sm bg-gray-100 px-2 py-1 rounded"
                                                    >{method}</span
                                                >
                                            {/each}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex gap-2 flex-wrap">
                                            {#each item.assessmentMethod as method}
                                                <span
                                                    class="text-sm text-blue-600 hover:underline cursor-pointer"
                                                    >{method}</span
                                                >
                                            {/each}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex gap-2">
                                            <Button variant="outline" size="sm"
                                                >Add Assessment</Button
                                            >
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
</PageLayout>
