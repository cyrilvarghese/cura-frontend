<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";

    let {
        open = $bindable(false),
        onSubmit,
        isLoading = $bindable(false),
    } = $props();

    let isSubmitting = false;

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.ctrlKey && !isSubmitting) {
            event.preventDefault();
            onSubmit();
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]" onkeydown={handleKeyDown}>
        <Dialog.Header>
            <Dialog.Title>End Case And Proceed To OSCE</Dialog.Title>
            <Dialog.Description>
                You'll be given a short MCQ to cover topics related to the
                disease.
            </Dialog.Description>
        </Dialog.Header>

        <div class="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onclick={() => (open = false)}
                >Cancel</Button
            >
            <Button
                variant="default"
                onclick={onSubmit}
                disabled={isLoading}
                class="gap-2"
            >
                {#if isLoading}
                    <LoaderCircle class="h-4 w-4 animate-spin" />
                    Generating OSCE...
                {:else}
                    Take me to the OSCE
                {/if}
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
