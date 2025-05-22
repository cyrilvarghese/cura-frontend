<script lang="ts">
    import { Separator } from "$lib/components/ui/separator";
    import {
        BookOpen,
        FileText,
        Info,
        ListTree,
        Stethoscope,
        AlertTriangle,
        FlaskConical,
        Loader2,
        AlertCircle,
    } from "lucide-svelte";
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { onMount } from "svelte";
    import { educationalResourcesFeedbackStore } from "$lib/stores/educationalResourcesFeedbackStore";

    // Optional props
    const { caseId = undefined } = $props();

    // Data comes from the dedicated store using runes
    const educationalCapsules = $derived(
        $educationalResourcesFeedbackStore.educationalResourcesFeedback
            ?.educationalCapsules,
    );
    const isLoading = $derived($educationalResourcesFeedbackStore.isLoading);
    const error = $derived($educationalResourcesFeedbackStore.error);

    onMount(async () => {
        try {
            await educationalResourcesFeedbackStore.getEducationalResources(
                caseId,
            );
        } catch (err) {
            console.error("Failed to load educational resources:", err);
        }
    });
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-200">
    <h3 class="text-xl font-medium text-green-800 mb-4 flex items-center gap-2">
        <BookOpen class="w-5 h-5" />
        Educational Resources
    </h3>

    {#if isLoading}
        <div class="flex justify-center items-center p-8">
            <Loader2 class="w-8 h-8 text-green-500 animate-spin" />
            <span class="ml-2">Loading educational resources...</span>
        </div>
    {:else if error}
        <div
            class="bg-red-50 p-4 rounded-md text-red-800 flex items-start gap-2"
        >
            <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
                <p class="font-medium">Error loading resources</p>
                <p class="text-sm">{error}</p>
            </div>
        </div>
    {:else if educationalCapsules}
        <div class="space-y-6">
            <!-- Primary Diagnosis Overview -->
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <h4 class="font-medium">Primary Diagnosis:</h4>
                    <Badge class="bg-green-100 text-green-800 border-green-200">
                        {educationalCapsules.primaryDxCapsule.dx}
                    </Badge>
                </div>

                <p class="text-sm text-gray-700 bg-green-50/50 p-3 rounded-md">
                    {educationalCapsules.primaryDxCapsule.overview}
                </p>
            </div>

            <!-- Primary Diagnosis Details -->
            <div>
                <Accordion.Root type="multiple">
                    <Accordion.Item
                        value="pathophysiology"
                        class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                    >
                        <Accordion.Trigger
                            class="p-3 bg-gray-50 font-medium text-sm flex items-start flex-row gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <FlaskConical class="w-4 h-4 text-green-700" />
                                Pathophysiology
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="p-3">
                            <ul
                                class="list-disc list-inside space-y-2 text-sm text-gray-700"
                            >
                                {#each educationalCapsules.primaryDxCapsule.pathoPoints as point}
                                    <li>{point}</li>
                                {/each}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        value="risk-factors"
                        class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                    >
                        <Accordion.Trigger
                            class="p-3 bg-gray-50 font-medium text-sm flex items-center gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <AlertTriangle class="w-4 h-4 text-amber-700" />
                                Risk Factors
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="p-3">
                            <ul
                                class="list-disc list-inside space-y-2 text-sm text-gray-700"
                            >
                                {#each educationalCapsules.primaryDxCapsule.etiologyRiskFactors as factor}
                                    <li>{factor}</li>
                                {/each}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        value="clinical-features"
                        class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                    >
                        <Accordion.Trigger
                            class="p-3 bg-gray-50 font-medium text-sm flex items-center gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <Stethoscope class="w-4 h-4 text-blue-700" />
                                Clinical Features
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="p-3">
                            <ul
                                class="list-disc list-inside space-y-2 text-sm text-gray-700"
                            >
                                {#each educationalCapsules.primaryDxCapsule.clinicalFeatures as feature}
                                    <li>{feature}</li>
                                {/each}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        value="complications"
                        class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                    >
                        <Accordion.Trigger
                            class="p-3 bg-gray-50 font-medium text-sm flex items-start gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <AlertTriangle class="w-4 h-4 text-red-700" />
                                Complications
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="p-3">
                            <ul
                                class="list-disc list-inside space-y-2 text-sm text-gray-700"
                            >
                                {#each educationalCapsules.primaryDxCapsule.complications as complication}
                                    <li>{complication}</li>
                                {/each}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        value="diagnostics"
                        class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                    >
                        <Accordion.Trigger
                            class="p-3 bg-gray-50 font-medium text-sm flex items-center gap-2"
                        >
                            <div class="flex items-center gap-2">
                                <ListTree class="w-4 h-4 text-purple-700" />
                                Diagnostic Modalities
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content class="p-3">
                            <ul
                                class="list-disc list-inside space-y-2 text-sm text-gray-700"
                            >
                                {#each educationalCapsules.primaryDxCapsule.diagModalities as modality}
                                    <li>{modality}</li>
                                {/each}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </div>

            <Separator />

            <!-- Differential Diagnoses Resources -->
            <div>
                <h4 class="font-medium mb-3 flex items-center gap-2">
                    <FileText class="w-4 h-4" />
                    Differential Diagnoses Resources
                </h4>

                <Accordion.Root type="single" collapsible>
                    {#each educationalCapsules.differentialDxCapsulesToEmbed as diff}
                        <Accordion.Item
                            value={diff.differentialDxName}
                            class="mb-2 border border-gray-100 rounded-md overflow-hidden"
                        >
                            <Accordion.Trigger
                                class="p-3 bg-gray-50 font-medium text-sm"
                            >
                                {diff.differentialDxName}
                            </Accordion.Trigger>
                            <Accordion.Content class="p-3">
                                <div class="space-y-4">
                                    <p class="text-sm text-gray-700">
                                        {diff.overview}
                                    </p>

                                    <div>
                                        <div class="bg-blue-50 p-3 rounded-md">
                                            <h5
                                                class="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2"
                                            >
                                                Key Differences from Primary Dx
                                            </h5>

                                            <Accordion.Root type="multiple">
                                                <Accordion.Item
                                                    value={`${diff.differentialDxName}-patho`}
                                                    class="border-t border-blue-100 pt-2 mt-2"
                                                >
                                                    <Accordion.Trigger
                                                        class="font-medium text-xs text-blue-600 py-1"
                                                    >
                                                        Pathophysiology
                                                    </Accordion.Trigger>
                                                    <Accordion.Content
                                                        class="pt-2"
                                                    >
                                                        <ul
                                                            class="list-disc list-inside space-y-1 text-xs text-blue-800"
                                                        >
                                                            {#each diff.pathoPoints as point}
                                                                <li>{point}</li>
                                                            {/each}
                                                        </ul>
                                                    </Accordion.Content>
                                                </Accordion.Item>

                                                <Accordion.Item
                                                    value={`${diff.differentialDxName}-etiology`}
                                                    class="border-t border-blue-100 pt-2 mt-2"
                                                >
                                                    <Accordion.Trigger
                                                        class="font-medium text-xs text-blue-600 py-1"
                                                    >
                                                        Risk Factors
                                                    </Accordion.Trigger>
                                                    <Accordion.Content
                                                        class="pt-2"
                                                    >
                                                        <ul
                                                            class="list-disc list-inside space-y-1 text-xs text-blue-800"
                                                        >
                                                            {#each diff.etiologyRiskFactors as factor}
                                                                <li>
                                                                    {factor}
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    </Accordion.Content>
                                                </Accordion.Item>

                                                <Accordion.Item
                                                    value={`${diff.differentialDxName}-clinical`}
                                                    class="border-t border-blue-100 pt-2 mt-2"
                                                >
                                                    <Accordion.Trigger
                                                        class="font-medium text-xs text-blue-600 py-1"
                                                    >
                                                        Clinical Features
                                                    </Accordion.Trigger>
                                                    <Accordion.Content
                                                        class="pt-2"
                                                    >
                                                        <ul
                                                            class="list-disc list-inside space-y-1 text-xs text-blue-800"
                                                        >
                                                            {#each diff.clinicalFeatures as feature}
                                                                <li>
                                                                    {feature}
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    </Accordion.Content>
                                                </Accordion.Item>

                                                <Accordion.Item
                                                    value={`${diff.differentialDxName}-diag`}
                                                    class="border-t border-blue-100 pt-2 mt-2"
                                                >
                                                    <Accordion.Trigger
                                                        class="font-medium text-xs text-blue-600 py-1"
                                                    >
                                                        Diagnostic Modalities
                                                    </Accordion.Trigger>
                                                    <Accordion.Content
                                                        class="pt-2"
                                                    >
                                                        <ul
                                                            class="list-disc list-inside space-y-1 text-xs text-blue-800"
                                                        >
                                                            {#each diff.diagModalities as modality}
                                                                <li>
                                                                    {modality}
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            </Accordion.Root>
                                        </div>
                                    </div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </div>
        </div>
    {:else}
        <div
            class="bg-gray-50 p-4 rounded-md text-gray-500 flex items-center justify-center"
        >
            <Info class="w-5 h-5 mr-2" />
            <span>No educational resources available</span>
        </div>
    {/if}
</div>
