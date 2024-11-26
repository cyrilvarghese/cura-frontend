<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";

    export let title: string;
    export let author: string;
    export let imageUrl: string;
    export let altText: string;
    export let caption: string | undefined = undefined;
</script>

<Dialog.Root>
    <Dialog.Trigger >
        <div class="group relative flex flex-col overflow-hidden rounded-lghover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <!-- Image Container -->
            <div class="relative aspect-[4/3] overflow-hidden">
                <img 
                    src={imageUrl} 
                    alt={altText}
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            
            <!-- Content Container -->
            <div class="flex flex-col p-4 bg-white">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">
                    {title}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                    {author}
                </p>
            </div>
        </div>
    </Dialog.Trigger>

    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            {#if caption}
                <Dialog.Description>{caption}</Dialog.Description>
            {/if}
        </Dialog.Header>

        <div class="relative w-full overflow-hidden rounded-lg">
            <img
                src={imageUrl}
                alt={altText}
                class="w-full h-auto object-contain"
            />
        </div>

        <Dialog.Footer class="flex justify-between items-center">
            <p class="text-sm text-muted-foreground">
                {author}
            </p>
            <Dialog.Close>
                <Button variant="outline">Close</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root> 