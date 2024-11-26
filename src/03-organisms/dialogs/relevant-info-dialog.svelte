<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";

    export let open = false;
    export let onSubmit: () => void;
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Relevant Information</Dialog.Title>
            <Dialog.Description>
                Submit the key relevant information you've gathered from this
                case.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <label for="relevantInfo" class="text-sm font-medium"
                    >Key Information</label
                >
                <textarea
                    id="relevantInfo"
                    class="min-h-[100px] w-full rounded-md border p-2"
                    placeholder="Enter the relevant information..."
                ></textarea>
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button variant="default" onclick={onSubmit}>
                Submit Information
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
