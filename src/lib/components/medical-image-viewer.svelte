<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";

    export let imageUrl: string;
    export let altText: string;
    export let caption: string | undefined = undefined;
    export let subtitle: string | undefined = undefined;
</script>

<Dialog.Root>
    <Dialog.Trigger class="w-full text-left border-none">
        <div class="group space-y-1.5">
            <!-- Image Container -->
            <div class="relative overflow-hidden rounded-md">
                <img
                    src={imageUrl}
                    alt={altText}
                    class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02] cursor-zoom-in"
                />
            </div>
        </div>
    </Dialog.Trigger>
    <!-- Caption and Timestamp -->
    {#if caption || subtitle}
        <div class=" flex flex-col flex-start">
            {#if caption}
                <p class="text-sm font-semibold text-muted-foreground">
                    {caption}
                </p>
            {/if}
        </div>
    {/if}

    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            {#if caption}
                <Dialog.Title>{caption}</Dialog.Title>
                <Dialog.Description
                    >{#if subtitle}
                        <p class="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    {/if}</Dialog.Description
                >
            {/if}
        </Dialog.Header>

        <div class="relative w-full overflow-hidden rounded-lg">
            <img
                src={imageUrl}
                alt={altText}
                class="w-full max-h-[500px] h-auto object-cover"
            />
        </div>

        <Dialog.Footer class="flex justify-start items-start">
            <Dialog.Close>
                <Button variant="outline">Close</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
