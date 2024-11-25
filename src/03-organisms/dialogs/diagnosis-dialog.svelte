<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import CheckCircle from "lucide-svelte/icons/check-circle";

    export let open = false;
    export let onSubmit: () => void;
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Submit Inital Diagnosis</Dialog.Title>
            <Dialog.Description>
                <p class="font-semibold">This is your initial diagnosis for Case #123, which you can change later.</p>
                <p>Please arrange your primary diagnosis at the top, followed by your differential diagnoses in the order of likelihood.</p>
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <h4 class="font-medium leading-none">Current Diagnosis</h4>
                <p class="text-sm text-muted-foreground">
                    Review your diagnosis before final submission
                </p>
                <!-- You can add a textarea or other form elements here if needed -->
            </div>
        </div>

        <Dialog.Footer>
            <div class="flex justify-between w-full">
                <Dialog.Close>
                    <Button variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button variant="default" on:click={onSubmit}>
                    Submit Diagnosis
                    <CheckCircle class="ml-2 h-4 w-4" />
                </Button>
            </div>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root> 