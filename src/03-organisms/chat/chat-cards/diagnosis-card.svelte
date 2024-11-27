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

    $: cardStyles = "border-l-blue-900/50 bg-white";
    $: iconColor = "text-blue-900/70";
    $: justificationTextColor = "text-gray-900";
</script>

<Card.Root
    class="w-[350px] max-w-2xl border-l-4 {cardStyles} rounded-none rounded-r-md shadow-sm"
>
    <Card.Header class="pb-4">
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                {#if type === "initial"}
                    <Stethoscope class="h-5 w-5 {iconColor}" />
                {:else}
                    <CheckCircle class="h-5 w-5 {iconColor}" />
                {/if}
                <Card.Title class="text-gray-800">
                    <div class=" px-3 py-1.5 rounded-md">
                        {diagnosis.primaryDiagnosis.text}
                    </div>
                </Card.Title>
            </div>
            <Badge 
                variant="outline" 
                class="bg-blue-50/50 text-blue-800 hover:bg-blue-50/80 border-blue-200"
            >
                {type === "initial" ? "Initial Diagnosis" : "Final Diagnosis"}
            </Badge>
        </div>
    </Card.Header>

    <Card.Content class="grid gap-4">
        <div class="space-y-4">
            <div class="space-y-2">
                <div class="bg-blue-50/50 px-3 py-2 rounded-md">
                    <p class="text-md font-normal {justificationTextColor} leading-relaxed">
                        {diagnosis.primaryDiagnosis.justification}
                    </p>
                </div>
            </div>
        </div>
    </Card.Content>
</Card.Root>
