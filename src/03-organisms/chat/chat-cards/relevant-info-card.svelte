<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import ClipboardList from "lucide-svelte/icons/clipboard-list";
    import CheckSquare from "lucide-svelte/icons/check-square";

    export let relevantInfo: string[] | string;

    $: points = Array.isArray(relevantInfo)
        ? relevantInfo
        : relevantInfo.split(",").map((point) => point.trim());
</script>

<Card.Root
    class="w-[350px] max-w-2xl border-l-4 border-l-yellow-900/50 rounded-none rounded-r-md shadow-sm bg-white"
>
    <Card.Header>
        <div class="space-y-2">
            <div class="flex items-center">
                <ClipboardList class="h-5 w-5 text-yellow-900/70" />
                <Card.Title class="text-yellow-900">
                    <div class="px-2 py-1.5 rounded-md">
                        Positive Clinical Findings
                    </div>
                </Card.Title>
            </div>
            <Badge
                variant="outline"
                class="bg-yellow-50/50 text-yellow-800 hover:bg-yellow-50/80 border-yellow-200"
            >
                Clinical Notes
            </Badge>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-2">
            <ul class="space-y-2">
                {#each points as point}
                    <li class="flex items-start gap-2">
                        <CheckSquare
                            class="h-5 w-5 text-gray-900/70 mt-0.5 flex-shrink-0"
                        />
                        <span class="text-sm text-gray-800 leading-relaxed"
                            >{point}</span
                        >
                    </li>
                {/each}
            </ul>
        </div>
    </Card.Content>
</Card.Root>
