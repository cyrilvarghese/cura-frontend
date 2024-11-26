<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    
    export let diagnosis: {
        primaryDiagnosis: {
            text: string;
            justification: string;
        };
        differentialDiagnoses: string[];
    };
</script>

<Card.Root class="w-full max-w-2xl border-l-4 border-l-blue-900/50 rounded-none rounded-r-md">
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Stethoscope class="h-5 w-5 text-blue-900/70" />
                <Card.Title>Initial Diagnosis</Card.Title>
            </div>
           
        </div>
    </Card.Header>

    <Card.Content class="grid gap-4">
        <div class="space-y-4">
            <!-- Primary Diagnosis Section -->
            <div class="space-y-2">
                 
                <p class="font-medium text-lg text-green-700">
                    {diagnosis.primaryDiagnosis.text}
                </p>
                <div class="bg-green-50/50 p-3 rounded-md">
                    <h4 class="font-medium text-sm text-green-900 mb-2">Justification</h4>
                    <p class="text-sm text-green-800">
                        {diagnosis.primaryDiagnosis.justification}
                    </p>
                </div>
            </div>

            <!-- Differential Diagnoses Section -->
            <div class="space-y-2">
                <Badge variant="outline" class="bg-blue-50 text-blue-700 border-blue-200">
                    Differential Diagnoses
                </Badge>
                <ul class="list-disc list-inside space-y-1">
                    {#each diagnosis.differentialDiagnoses as differential}
                        <li class="text-sm text-muted-foreground">{differential}</li>
                    {/each}
                </ul>
            </div>
        </div>
    </Card.Content>
</Card.Root> 