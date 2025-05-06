<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import CheckCircle from "lucide-svelte/icons/check-circle";

    export let type: "initial" | "final" = "initial";
    export let diagnosis: {
        primaryDiagnosis: {
            text: string;
            justification: string;
        };
        differentialDiagnoses?: string[];
    };

    // Define styles based on the diagnosis type
    $: cardStyles =
        type === "final"
            ? "border-l-red-500 bg-white"
            : "border-l-blue-900/50 bg-white";
    $: iconColor = type === "final" ? "text-red-500" : "text-blue-900/70";
    $: justificationTextColor =
        type === "final" ? "text-gray-900" : "text-gray-900";
    $: justificationBgColor =
        type === "final" ? "bg-red-50/50" : "bg-blue-50/50";
</script>

<Card.Root
    class="w-[350px] max-w-2xl border-l-4 {cardStyles} rounded-none rounded-r-md shadow-sm"
>
    <Card.Header>
        <div class="space-y-2">
            <div class="flex items-center">
                {#if type === "initial"}
                    <Stethoscope class="h-5 w-5 {iconColor}" />
                {:else}
                    <CheckCircle class="h-5 w-5 {iconColor}" />
                {/if}
                <Card.Title>
                    {#if type === "initial"}
                        <div class="px-2 py-1.5 rounded-md">
                            {diagnosis.primaryDiagnosis.text}
                        </div>
                    {:else}
                        <div class="px-2 py-1.5 text-red-600 rounded-md">
                            {diagnosis.primaryDiagnosis.text}
                        </div>
                    {/if}
                </Card.Title>
            </div>
            <Badge
                variant="outline"
                class={type === "final"
                    ? "bg-red-50/50 text-red-800 hover:bg-red-50/80 border-red-200"
                    : "bg-blue-50/50 text-blue-800 hover:bg-blue-50/80 border-blue-200"}
            >
                {type === "initial" ? "Initial Diagnosis" : "Final Diagnosis"}
            </Badge>
            <div class="{justificationBgColor} px-3 rounded-md">
                <p
                    class="pt-2 pb-2 text-md font-normal {justificationTextColor} leading-relaxed"
                >
                    {@debug diagnosis}
                    {diagnosis.primaryDiagnosis.justification}
                </p>
            </div>
        </div>
    </Card.Header>

    <Card.Content class="pt-2">
        <div class="space-y-4">
            <div class="space-y-2">
                {#if type === "initial" && diagnosis.differentialDiagnoses?.length}
                    <div class="mt-4">
                        <h4 class="text-sm font-semibold mb-2">
                            Differential Diagnoses:
                        </h4>
                        <ul class="list-disc list-inside space-y-1">
                            {#each diagnosis.differentialDiagnoses as differential}
                                <li class="text-sm text-gray-700">
                                    {differential}
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}
            </div>
        </div>
    </Card.Content>
</Card.Root>
