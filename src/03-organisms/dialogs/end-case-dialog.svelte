<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";

    export let open = false;
    export let onSubmit: () => void;

    let isSubmitting = false;

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && event.ctrlKey && !isSubmitting) {
            event.preventDefault();
            onSubmit();
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content 
        class="sm:max-w-[425px]"
        onkeydown={handleKeyDown}
    >
        <Dialog.Header>
            <Dialog.Title>End Case</Dialog.Title>
            <Dialog.Description>
                Are you sure you want to end this case? This action cannot be undone.
            </Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline"  
                    >Cancel</Button
                >
            </Dialog.Close>
            <Button variant="destructive" onclick={onSubmit}>
                End Case
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root> 