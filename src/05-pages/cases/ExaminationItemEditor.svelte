<script lang="ts">
    import ImageEditor from "./ImageEditor.svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Label } from "$lib/components/ui/label";

    export let key: string;
    export let value: any; // Specify the type as needed
    export let onUpdate: (updatedValue: any) => void; // Callback prop for update

    // Default value for findings
    const defaultFindings = { type: "", content: "" };
    const findings = value.findings || defaultFindings; // Use default if undefined

    function handleUpdate(updatedValue: any) {
        onUpdate({
            [key]: {
                ...value,
                findings: updatedValue.findings || defaultFindings,
            },
        }); // Ensure findings is defined
    }
</script>

<div class="border p-4 mb-4 rounded-md">
    <h3 class="text-md font-semibold">{key}</h3>
    <Label for="purpose-{key}">Purpose</Label>
    <Input
        id="purpose-{key}"
        bind:value={value.purpose}
        oninput={() => handleUpdate(value)}
    />

    <Label for="findings-type-{key}">Findings Type</Label>
    <Input
        id="findings-type-{key}"
        bind:value={findings.type}
        oninput={() => handleUpdate({ ...value, findings })}
    />

    <Label for="findings-content-{key}">Findings Content</Label>
    <Input
        id="findings-content-{key}"
        bind:value={findings.content}
        oninput={() => handleUpdate({ ...value, findings })}
    />

    <ImageEditor {value} onUpdate={handleUpdate} />
</div>
