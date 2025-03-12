<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";

    export let open = false;
    export let competencyCode: string;
    export let competencyText: string;
    export let onSubmit: (data: any) => void;

    let title = "";
    let description = competencyText;
    let topics = "";
    let isSubmitting = false;

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        onSubmit({ title, description, topics, type: "viva" });
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[600px]">
        <Dialog.Header>
            <Dialog.Title>Add Viva Assessment</Dialog.Title>
            <Dialog.Description>
                Create a new viva assessment for competency {competencyCode}
            </Dialog.Description>
        </Dialog.Header>

        <form on:submit={handleSubmit} class="space-y-6">
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="title">Title</label>
                    <Input id="title" bind:value={title} required />
                </div>
                <div class="grid gap-2">
                    <label for="description">Description</label>
                    <Textarea
                        id="description"
                        bind:value={description}
                        required
                    />
                </div>
                <div class="grid gap-2">
                    <label for="topics">Topics to Cover</label>
                    <Textarea id="topics" bind:value={topics} required />
                </div>
            </div>

            <Dialog.Footer>
                <Dialog.Close>
                    <Button type="button" variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button type="submit">Create Viva Assessment</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
