<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js"; 
    import { Button } from "$lib/components/ui/button/index.js"; 
    import { Label } from '$lib/components/ui/label';

    export let value: { url: string; altText: string; caption: string }; // Define the structure of value
    export let onUpdate: (updatedValue: { url: string; altText: string; caption: string } | null) => void; // Allow null

    function handleUpdate() {
        onUpdate(value); // Call the callback prop with the current value
    }
</script>

<div>
    <Label for="image-url">Image URL</Label>
    <Input id="image-url" bind:value={value.url} oninput={handleUpdate} />

    <Label for="image-alt">Alt Text</Label>
    <Input id="image-alt" bind:value={value.altText} oninput={handleUpdate} />

    <Label for="image-caption">Caption</Label>
    <Input id="image-caption" bind:value={value.caption} oninput={handleUpdate} />

    <Button onclick={() => onUpdate(null)}>Remove</Button> <!-- Example for remove action -->
</div> 