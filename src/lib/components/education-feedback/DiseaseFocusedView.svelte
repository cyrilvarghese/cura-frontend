<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        FileText,
        FlaskConical,
        AlertTriangle,
        Stethoscope,
        ListTree,
    } from "lucide-svelte";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { fade } from "svelte/transition";

    export let educationalCapsules;

    // Create array of all diseases for tabs
    $: allDiseases = [
        {
            name: educationalCapsules?.primaryDxCapsule.dx,
            isPrimary: true,
            data: educationalCapsules?.primaryDxCapsule,
        },
        ...(educationalCapsules?.differentialDxCapsulesToEmbed || []).map(
            (diff: any) => ({
                name: diff.differentialDxName,
                isPrimary: false,
                data: diff,
            }),
        ),
    ];
</script>

{#if !educationalCapsules}
    <div class="text-red-600 p-4">No data available.</div>
{:else}
    <div class="space-y-6">
        <!-- Primary Diagnosis Overview -->
        <!-- <div class="bg-blue-50 p-6 rounded-xl shadow-sm">
            <div class="flex items-center gap-2 mb-3">
                <h4 class="font-medium">Primary Diagnosis:</h4>
                <Badge class="bg-green-100 text-green-800 border-green-200">
                    {educationalCapsules.primaryDxCapsule.dx}
                </Badge>
            </div>

            <p class="text-sm text-gray-700 bg-white/50 p-3 rounded-md">
                {educationalCapsules.primaryDxCapsule.overview}
            </p>
        </div> -->

        <!-- Tabs for all diseases -->
        <Tabs.Root class="w-full" value={allDiseases[0].name}>
            <Tabs.List
                class="flex justify-start gap-x-4 bg-gray-50 rounded-lg px-4 py-3"
            >
                {#each allDiseases as disease}
                    <Tabs.Trigger
                        value={disease.name}
                        class="relative px-3 py-1.5 rounded-md text-base font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                    >
                        {disease.name}
                        {#if disease.isPrimary}
                            <Badge
                                class="ml-2 bg-green-100 text-green-800 border-none text-xs font-normal"
                                >Primary</Badge
                            >
                        {/if}
                    </Tabs.Trigger>
                {/each}
            </Tabs.List>

            {#each allDiseases as disease}
                <Tabs.Content value={disease.name} class="mt-4">
                    <div class="flex flex-row flex-wrap gap-4">
                        <!-- Pathophysiology Card -->
                        <div
                            in:fade
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-blue-50"
                            >
                                <h4
                                    class="font-medium text-blue-800 flex items-center gap-2"
                                >
                                    <FlaskConical class="w-4 h-4" /> Pathophysiology
                                </h4>
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.data.pathoPoints as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>

                        <!-- Risk Factors Card -->
                        <div
                            in:fade
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-orange-50"
                            >
                                <h4
                                    class="font-medium text-orange-800 flex items-center gap-2"
                                >
                                    <AlertTriangle class="w-4 h-4" /> Risk Factors
                                    & Etiology
                                </h4>
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.data.etiologyRiskFactors as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>

                        <!-- Clinical Features Card -->
                        <div
                            in:fade
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-green-50"
                            >
                                <h4
                                    class="font-medium text-green-800 flex items-center gap-2"
                                >
                                    <Stethoscope class="w-4 h-4" /> Clinical Features
                                </h4>
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.data.clinicalFeatures as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>

                        <!-- Diagnostic Modalities Card -->
                        <div
                            in:fade
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-purple-50"
                            >
                                <h4
                                    class="font-medium text-purple-800 flex items-center gap-2"
                                >
                                    <ListTree class="w-4 h-4" /> Diagnostic Modalities
                                </h4>
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.data.diagModalities as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Tabs.Content>
            {/each}
        </Tabs.Root>
    </div>
{/if}
