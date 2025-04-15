<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import Pill from "lucide-svelte/icons/pill";

    type MedicationProtocol = {
        drugName: string;
        dosage: string;
        indication: string;
        isPrimary: boolean;
    };

    type TreatmentData = {
        treatmentProtocol: MedicationProtocol[];
    };

    export let treatment: TreatmentData;
</script>

<Card.Root
    class="w-[350px] max-w-2xl border-l-4 border-l-green-900/50 rounded-none rounded-r-md shadow-sm bg-white"
>
    <Card.Header>
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <Card.Title class="text-gray-600">Treatment Protocol</Card.Title
                >
            </div>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-4">
            {#each treatment.treatmentProtocol as med}
                <div class="space-y-2 border-b pb-3 last:border-b-0">
                    <Badge
                        variant="outline"
                        class="bg-green-50/50 text-green-800 hover:bg-green-50/80 border-green-200 flex items-center gap-1 text-base font-medium"
                    >
                        <Pill class="h-3 w-3" />
                        {med.drugName}
                        {#if med.isPrimary}
                            <span class="ml-2 text-xs">(First line)</span>
                        {/if}
                    </Badge>
                    <div class="pl-4 space-y-1">
                        <p class="text-md text-green-800">
                            {med.dosage}
                        </p>
                        {#if med.indication}
                            <p class="text-sm">
                                {med.indication}
                            </p>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </Card.Content>
</Card.Root>
