<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import ClipboardList from "lucide-svelte/icons/clipboard-list";
    import CheckSquare from "lucide-svelte/icons/check-square";
    
    export let relevantInfo: string[] | string;

    $: points = Array.isArray(relevantInfo) 
        ? relevantInfo 
        : relevantInfo.split(',').map(point => point.trim());
</script>

<Card.Root class="w-[350px] max-w-2xl border-l-4 border-l-blue-900/50 rounded-none rounded-r-md shadow-sm bg-white">
    <Card.Header>
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <ClipboardList class="h-5 w-5 text-gray-900/70" />
                <Card.Title class="text-gray-600">Positive Clinical Findings</Card.Title>
            </div>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-2">
            <Badge 
                variant="outline" 
                class="bg-blue-50/50 text-blue-800 hover:bg-blue-50/80 border-blue-200"
            >
                Clinical Notes
            </Badge> 
            <ul class="space-y-2">
                {#each points as point}
                    <li class="flex items-start gap-2">
                        <CheckSquare class="h-5 w-5 text-blue-900/70 mt-0.5 flex-shrink-0" />
                        <span class="text-sm text-blue-800 leading-relaxed">{point}</span>
                    </li>
                {/each}
            </ul>
        </div>
    </Card.Content>
</Card.Root> 