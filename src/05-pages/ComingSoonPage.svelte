<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    export let title: string;
</script>

<div class="container mx-auto px-10 py-20">
    <div class="flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{title}</h1>
        </div>

        <Card.Root>
            <Card.Content
                class="flex flex-col items-center justify-center py-16"
            >
                <h2 class="text-2xl font-semibold text-muted-foreground mb-4">
                    Coming Soon
                </h2>
                <p class="text-muted-foreground">
                    This feature is currently under development.
                </p>
                <div class="mt-8 w-16 h-1 bg-primary rounded-full"></div>
            </Card.Content>
        </Card.Root>
    </div>
</div>
