<script lang="ts">
    import Edit from "lucide-svelte/icons/edit";
    import { Button } from "$lib/components/ui/button";
    import type { TabularData } from "$lib/types";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Table from "$lib/components/ui/table";
    import { editPETableStore } from "$lib/stores/editPETableStore";

    const { data, caseId, testName, testType } = $props<{
        data: TabularData;
        caseId: string;
        testName: string;
        testType: string;
    }>();

    console.log("data:", data);

    let showEditDialog = $state(false);
    let editingRow = $state<(string | number)[] | null>(null);

    function handleRowEdit(rowData: (string | number)[]) {
        console.log("Editing row with:", {
            caseId,
            testName,
            testType,
            rowData,
        });
        editingRow = [...rowData];
        showEditDialog = true;
    }

    async function handleSave() {
        if (editingRow) {
            await editPETableStore.updateTable(
                caseId,
                testName,
                testType,
                editingRow,
            );
            showEditDialog = false;
        }
    }
</script>

<Table.Root>
    <Table.Header>
        <Table.Row>
            {#each data.headers as header}
                <Table.Head>{header}</Table.Head>
            {/each}
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each data.rows as row}
            <Table.Row>
                {#each row as cell}
                    <Table.Cell>{cell}</Table.Cell>
                {/each}
                <Table.Cell>
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => handleRowEdit(row)}
                        class="h-8 w-8 p-0 ml-2"
                    >
                        <Edit class="h-4 w-4" />
                        <span class="sr-only">Edit row</span>
                    </Button>
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

<Dialog.Root bind:open={showEditDialog}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Edit Row</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            {#if editingRow}
                {#each data.headers as header, index}
                    <div class="grid grid-cols-4 items-center gap-4">
                        <label
                            for={`field-${index}`}
                            class="text-right text-sm font-medium"
                        >
                            {header}
                        </label>
                        <input
                            id={`field-${index}`}
                            type="text"
                            bind:value={editingRow[index]}
                            class="col-span-3 h-10 rounded-md border border-input px-3"
                        />
                    </div>
                {/each}
            {/if}
        </div>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (showEditDialog = false)}>
                Cancel
            </Button>
            <Button onclick={handleSave}>Save changes</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
