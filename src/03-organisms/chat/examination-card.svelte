<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import { getRelativeTime } from "$lib/utils/time";

    export let result: {
        name: string;
        purpose: string;
        findings: string;
        timestamp: Date;
    };
</script>

<Card.Root
    class="w-full max-w-2xl border-l-4 border-l-blue-500/50 rounded-none rounded-r-md "
>
    <Card.Header>
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Stethoscope class="h-5 w-5 text-blue-500/70" />
                <Card.Title class="pr-4">{result.name}</Card.Title>
            </div>
            <Badge
                variant="secondary"
                class="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
            >
                Physical Exam
            </Badge>
        </div>
        <Card.Description class="mt-2">{result.purpose}</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="space-y-2 bg-blue-50/50 p-3 rounded-md">
            <h4 class="font-medium leading-none text-blue-700">Findings</h4>
            <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                {result.findings}
            </p>
        </div>
    </Card.Content>
    <Card.Footer>
        <p class="text-sm text-muted-foreground">
            {getRelativeTime(result.timestamp)}
        </p>
    </Card.Footer>
</Card.Root>
