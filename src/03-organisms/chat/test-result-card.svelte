<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import TestTube from "lucide-svelte/icons/test-tube";
    import { getRelativeTime } from "$lib/utils/time";

    export let result: {
        testName: string;
        purpose: string;
        status: "completed" | "pending" | "failed";
        results: string;
        interpretation: string;
        timestamp: Date;
    };

    const statusColors = {
        completed: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
        failed: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
    };
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 border-l-amber-900/50 rounded-none rounded-r-md"
>
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <TestTube class="h-5 w-5 text-amber-900/70" />
                <Card.Title class="pr-4">{result.testName}</Card.Title>
            </div>
            <Badge class={statusColors[result.status]}>
                {result.status}
            </Badge>
        </div>
        <Card.Description class="mt-2">{result.purpose}</Card.Description>
    </Card.Header>
    <Card.Content class="grid gap-4">
        <div class="space-y-2 bg-amber-50/50 p-3 rounded-md">
            <h4 class="font-medium leading-none text-amber-900">Results</h4>
            <p class="text-sm text-muted-foreground">{result.results}</p>
        </div>
    </Card.Content>
    <Card.Footer>
        <p class="text-sm text-muted-foreground">
            {getRelativeTime(result.timestamp)}
        </p>
    </Card.Footer>
</Card.Root>
