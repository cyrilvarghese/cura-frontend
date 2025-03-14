<script lang="ts">
    import { ChevronDown } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import CaseDialog from "../../03-organisms/dialogs/case-assessment-dialog.svelte";
    import OsceDialog from "../../03-organisms/dialogs/osce-assessment-dialog.svelte";
    import WrittenDialog from "../../03-organisms/dialogs/written-assessment-dialog.svelte";
    import VivaDialog from "../../03-organisms/dialogs/viva-assessment-dialog.svelte";
    import { navigate } from "svelte-routing";
    import type { Document } from "$lib/types/curriculum";
    let {
        documents = [],
        competencyCode = "",
        competencyText = "",
        disabled = false,
        topic = "",
    } = $props<{
        documents: Document[];
        competencyCode: string;
        competencyText: string;
        disabled?: boolean;
        topic?: string;
    }>();

    let showCaseDialog = $state(false);
    let showOsceDialog = $state(false);
    let showWrittenDialog = $state(false);
    let showVivaDialog = $state(false);

    function handleAssessment(type: string) {
        switch (type) {
            case "case":
                navigate(`/curriculum/${topic}/${competencyCode}/new-case`);
                break;
            case "osce":
                showOsceDialog = true;
                break;
            case "written":
                showWrittenDialog = true;
                break;
            case "viva":
                showVivaDialog = true;
                break;
        }
    }
</script>

<div class="flex">
    <Button
        variant="outline"
        size="sm"
        class="rounded-r-none"
        {disabled}
        onclick={() => handleAssessment("case")}
    >
        Add Assessment
    </Button>
    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <Button
                variant="outline"
                size="sm"
                class="rounded-l-none border-l-0 px-2"
            >
                <ChevronDown class="h-4 w-4" />
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
            <DropdownMenu.Item onclick={() => handleAssessment("case")}
                >Case</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => handleAssessment("osce")}
                >OSCE</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => handleAssessment("written")}
                >Written</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => handleAssessment("viva")}
                >Viva</DropdownMenu.Item
            >
        </DropdownMenu.Content>
    </DropdownMenu.Root>

    <CaseDialog
        bind:open={showCaseDialog}
        {documents}
        {competencyCode}
        {competencyText}
    />
    <OsceDialog
        bind:open={showOsceDialog}
        {competencyCode}
        {competencyText}
        onSubmit={(data) => console.log("OSCE:", data)}
    />
    <WrittenDialog
        bind:open={showWrittenDialog}
        {competencyCode}
        {competencyText}
        onSubmit={(data) => console.log("Written:", data)}
    />
    <VivaDialog
        bind:open={showVivaDialog}
        {competencyCode}
        {competencyText}
        onSubmit={(data) => console.log("Viva:", data)}
    />
</div>
