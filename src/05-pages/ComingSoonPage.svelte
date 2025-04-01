<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    export let title: string;
</script>

<div class="flex flex-col p-8 mt-14">
    <h1 class="text-4xl font-bold mb-8">{title}</h1>

    <div class="flex items-center justify-center flex-1">
        <Card.Root class="w-[500px] shadow-lg mt-20">
            <Card.Header class="text-center">
                <Card.Title class="text-2xl text-muted-foreground"
                    >Coming Soon</Card.Title
                >
            </Card.Header>

            <Card.Content class="text-center">
                <p class="text-sm text-muted-foreground">
                    This feature is currently under development.
                </p>
            </Card.Content>

            <Card.Footer class="flex justify-center pt-6">
                <div class="w-16 h-1 bg-primary rounded-full"></div>
            </Card.Footer>
        </Card.Root>
    </div>
</div>
