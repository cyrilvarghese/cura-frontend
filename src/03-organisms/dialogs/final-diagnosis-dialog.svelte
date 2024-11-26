<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { type VariantProps } from "class-variance-authority";

    export let open = false;
    export let onSubmit: () => void;

    type ButtonVariants = VariantProps<typeof Button>["variant"];
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Final Diagnosis</Dialog.Title>
            <Dialog.Description>
                Submit your final diagnosis and conclusions for this case. This will be your official diagnostic assessment.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="space-y-2">
                <label for="diagnosis" class="text-sm font-medium">Final Diagnosis</label>
                <textarea 
                    id="diagnosis"
                    class="min-h-[100px] w-full rounded-md border p-2" 
                    placeholder="Enter your final diagnosis..."
                />
            </div>
            <div class="space-y-2">
                <label for="rationale" class="text-sm font-medium">Clinical Rationale</label>
                <textarea 
                    id="rationale"
                    class="min-h-[100px] w-full rounded-md border p-2" 
                    placeholder="Explain your diagnostic reasoning..."
                />
            </div>
        </div>

        <Dialog.Footer>
            <Button 
                variant={"outline" satisfies ButtonVariants}
                on:click={() => (open = false)}
            >
                Cancel
            </Button>
            <Button 
                variant={"default" satisfies ButtonVariants}
                on:click={onSubmit}
            >
                Submit Final Diagnosis
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root> 
