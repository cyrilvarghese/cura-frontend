<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        FlaskConical,
        AlertTriangle,
        Stethoscope,
        ListTree,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";

    const { educationalCapsules } = $props();

    // Transform data for comparative view
    const comparativeData = $derived({
        pathophysiology: [
            {
                name: educationalCapsules.primaryDxCapsule.dx,
                points: educationalCapsules.primaryDxCapsule.pathoPoints,
                isPrimary: true,
            },
            ...educationalCapsules.differentialDxCapsulesToEmbed.map(
                (diff: any) => ({
                    name: diff.differentialDxName,
                    points: diff.pathoPoints,
                    isPrimary: false,
                }),
            ),
        ],
        riskFactors: [
            {
                name: educationalCapsules.primaryDxCapsule.dx,
                points: educationalCapsules.primaryDxCapsule
                    .etiologyRiskFactors,
                isPrimary: true,
            },
            ...educationalCapsules.differentialDxCapsulesToEmbed.map(
                (diff: any) => ({
                    name: diff.differentialDxName,
                    points: diff.etiologyRiskFactors,
                    isPrimary: false,
                }),
            ),
        ],
        clinicalFeatures: [
            {
                name: educationalCapsules.primaryDxCapsule.dx,
                points: educationalCapsules.primaryDxCapsule.clinicalFeatures,
                isPrimary: true,
            },
            ...educationalCapsules.differentialDxCapsulesToEmbed.map(
                (diff: any) => ({
                    name: diff.differentialDxName,
                    points: diff.clinicalFeatures,
                    isPrimary: false,
                }),
            ),
        ],
        diagnostics: [
            {
                name: educationalCapsules.primaryDxCapsule.dx,
                points: educationalCapsules.primaryDxCapsule.diagModalities,
                isPrimary: true,
            },
            ...educationalCapsules.differentialDxCapsulesToEmbed.map(
                (diff: any) => ({
                    name: diff.differentialDxName,
                    points: diff.diagModalities,
                    isPrimary: false,
                }),
            ),
        ],
    });
</script>

<div class="space-y-6">
    <div class="bg-blue-50 p-3 rounded-md">
        <p class="text-sm text-blue-800 font-medium">
            Comparative Analysis: Primary Diagnosis vs Differentials
        </p>
    </div>

    <Accordion.Root type="multiple">
        <!-- Pathophysiology Comparison -->
        <Accordion.Item
            value="compare-pathophysiology"
            class="mb-2 border border-gray-100 rounded-md overflow-hidden"
        >
            <Accordion.Trigger
                class="w-full p-3 bg-gray-50 font-medium text-sm flex items-center gap-2 text-left"
            >
                <div class="w-full flex items-center gap-2">
                    <FlaskConical class="w-4 h-4 text-blue-600" />
                    Pathophysiology Comparison
                </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-0">
                <div class="flex flex-wrap gap-4 p-4">
                    {#each comparativeData.pathophysiology as disease}
                        <div
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-blue-50 flex items-center gap-2"
                            >
                                <span class="font-medium text-blue-800"
                                    >{disease.name}</span
                                >
                                <!-- {#if disease.isPrimary}
                                    <Badge
                                        class="ml-2 bg-green-100 text-green-800 border-none text-xs font-normal"
                                        >Primary</Badge
                                    >
                                {/if} -->
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.points as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/each}
                </div>
            </Accordion.Content>
        </Accordion.Item>

        <!-- Risk Factors Comparison -->
        <Accordion.Item
            value="compare-risk-factors"
            class="mb-2 border border-gray-100 rounded-md overflow-hidden"
        >
            <Accordion.Trigger
                class="w-full p-3 bg-gray-50 font-medium text-sm flex items-center gap-2 text-left"
            >
                <div class="w-full flex items-center gap-2">
                    <AlertTriangle class="w-4 h-4 text-orange-600" />
                    Risk Factors & Etiology Comparison
                </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-0">
                <div class="flex flex-wrap gap-4 p-4">
                    {#each comparativeData.riskFactors as disease}
                        <div
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-orange-50 flex items-center gap-2"
                            >
                                <span class="font-medium text-orange-800"
                                    >{disease.name}</span
                                >
                                {#if disease.isPrimary}
                                    <Badge
                                        class="ml-2 bg-green-100 text-green-800 border-none text-xs font-normal"
                                        >Primary</Badge
                                    >
                                {/if}
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.points as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/each}
                </div>
            </Accordion.Content>
        </Accordion.Item>

        <!-- Clinical Features Comparison -->
        <Accordion.Item
            value="compare-clinical-features"
            class="mb-2 border border-gray-100 rounded-md overflow-hidden"
        >
            <Accordion.Trigger
                class="w-full p-3 bg-gray-50 font-medium text-sm flex items-center gap-2 text-left"
            >
                <div class="w-full flex items-center gap-2">
                    <Stethoscope class="w-4 h-4 text-teal-600" />
                    Clinical Features Comparison
                </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-0">
                <div class="flex flex-wrap gap-4 p-4">
                    {#each comparativeData.clinicalFeatures as disease}
                        <div
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-green-50 flex items-center gap-2"
                            >
                                <span class="font-medium text-green-800"
                                    >{disease.name}</span
                                >
                                {#if disease.isPrimary}
                                    <Badge
                                        class="ml-2 bg-green-100 text-green-800 border-none text-xs font-normal"
                                        >Primary</Badge
                                    >
                                {/if}
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.points as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/each}
                </div>
            </Accordion.Content>
        </Accordion.Item>

        <!-- Diagnostic Modalities Comparison -->
        <Accordion.Item
            value="compare-diagnostics"
            class="mb-2 border border-gray-100 rounded-md overflow-hidden"
        >
            <Accordion.Trigger
                class="w-full p-3 bg-gray-50 font-medium text-sm flex items-start gap-2 text-left"
            >
                <div class="w-full flex items-center gap-2">
                    <ListTree class="w-4 h-4 text-purple-600" />
                    Diagnostic Modalities Comparison
                </div>
            </Accordion.Trigger>
            <Accordion.Content class="p-0">
                <div class="flex flex-wrap gap-4 p-4">
                    {#each comparativeData.diagnostics as disease}
                        <div
                            class="w-[40%] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                class="px-4 py-3 border-b border-gray-100 bg-purple-50 flex items-center gap-2"
                            >
                                <span class="font-medium text-purple-800"
                                    >{disease.name}</span
                                >
                                {#if disease.isPrimary}
                                    <Badge
                                        class="ml-2 bg-green-100 text-green-800 border-none text-xs font-normal"
                                        >Primary</Badge
                                    >
                                {/if}
                            </div>
                            <div class="p-4">
                                <ul
                                    class="list-disc ml-6 text-sm text-gray-700"
                                >
                                    {#each disease.points as point}
                                        <li>{point}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/each}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    </Accordion.Root>
</div>
