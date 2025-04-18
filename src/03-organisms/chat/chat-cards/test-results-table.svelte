<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import type { TabularData } from "$lib/types";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import Edit from "lucide-svelte/icons/edit";
    import { Trash2 } from "lucide-svelte";
    import { editPhysicalExamTableStore } from "$lib/stores/editTablePEStore";
    import { getContext } from "svelte";

    const caseType = getContext<"new" | "edit">("case-type");

    const {
        data: propData,
        caseId,
        testName,
        testType = "lab_test",
    } = $props<{
        data: TabularData;
        caseId?: string;
        testName?: string;
        testType?: string;
    }>();

    // Create a local reactive copy of the data
    let localData = $state<TabularData>({
        headers: [...propData.headers],
        rows: propData.rows.map((row: (string | number)[]) => [...row]),
    });

    let showEditDialog = $state(false);
    let editingRow = $state<(string | number)[] | null>(null);
    let editingRowIndex = $state(-1);

    function handleEdit(row: (string | number)[], index: number) {
        editingRow = [...row];
        editingRowIndex = index;
        showEditDialog = true;
    }

    async function handleSave() {
        if (editingRow && caseId && testName) {
            const success = await editPhysicalExamTableStore.updateTable(
                caseId,
                testName,
                testType,
                editingRow,
            );

            if (success && editingRowIndex !== -1) {
                // Update the local reactive data
                localData.rows[editingRowIndex] = [...editingRow];
            }

            showEditDialog = false;
            editingRowIndex = -1;
        }
    }

    function handleAddRow() {
        // Create an empty row with the correct number of columns
        const emptyRow = Array(localData.headers.length).fill("");

        // Add the empty row to the data
        localData.rows = [...localData.rows, emptyRow];

        // Immediately open the edit dialog for the new row
        editingRow = emptyRow;
        editingRowIndex = localData.rows.length - 1;
        showEditDialog = true;
    }

    async function handleDelete(index: number) {
        if (confirm("Are you sure you want to delete this row?")) {
            // Get the parameter name (row identifier) from the first column
            const rowIdentifier = localData.rows[index][0].toString();

            if (caseId && testName) {
                // Call the API to delete the row
                const success = await editPhysicalExamTableStore.deleteRow(
                    caseId,
                    testName,
                    testType,
                    rowIdentifier,
                );

                if (success) {
                    // Remove the row from the local data if API call was successful
                    localData.rows = localData.rows.filter(
                        (_, i) => i !== index,
                    );

                    // Close the edit dialog if it's open
                    if (showEditDialog) {
                        showEditDialog = false;
                        editingRow = null;
                        editingRowIndex = -1;
                    }
                }
            }
        }
    }

    const isAllowedEdit = $derived(
        (caseId && testName && caseType === "edit") || caseType === "new",
    );
</script>

{#if caseId && testName}
    <div class="flex justify-between items-center mb-4">
        <h4 class="ml-4 font-medium leading-none text-amber-900">Results</h4>
        {#if isAllowedEdit}
            <button
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onclick={handleAddRow}
            >
                Add Row
            </button>
        {/if}
    </div>
{/if}

<Table.Root>
    <Table.Header>
        <Table.Row>
            {#each localData.headers as header}
                <Table.Head>{header}</Table.Head>
            {/each}
            {#if isAllowedEdit}
                <Table.Head class="w-[100px]">Actions</Table.Head>
            {/if}
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each localData.rows as row, index}
            <Table.Row>
                {#each row as cell}
                    <Table.Cell>{cell}</Table.Cell>
                {/each}
                {#if isAllowedEdit}
                    <Table.Cell>
                        <div class="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onclick={() => handleEdit(row, index)}
                                class="h-8 w-8 p-0 ml-2"
                            >
                                <Edit class="h-4 w-4" />
                                <span class="sr-only">Edit row</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onclick={() => handleDelete(index)}
                                class="h-8 w-8 p-0 ml-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                                <Trash2 class="h-4 w-4" />
                                <span class="sr-only">Delete row</span>
                            </Button>
                        </div>
                    </Table.Cell>
                {/if}
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>

{#if caseId && testName}
    <Dialog.Root bind:open={showEditDialog}>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>Edit Row</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                {#if editingRow}
                    {#each localData.headers as header, index}
                        <div class="grid grid-cols-4 items-center gap-4">
                            <label
                                for={`field-${index}`}
                                class="text-right text-sm font-medium"
                            >
                                {header}
                            </label>
                            {#if index === 0 && editingRowIndex < localData.rows.length - 1}
                                <!-- First column is read-only for existing rows -->
                                <div
                                    class="col-span-3 h-10 rounded-md border border-input bg-muted px-3 flex items-center"
                                >
                                    {editingRow[index]}
                                </div>
                            {:else}
                                <input
                                    id={`field-${index}`}
                                    type="text"
                                    bind:value={editingRow[index]}
                                    class="col-span-3 h-10 rounded-md border border-input px-3"
                                />
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
            <Dialog.Footer>
                <Button
                    variant="outline"
                    onclick={() => (showEditDialog = false)}
                >
                    Cancel
                </Button>
                <Button onclick={handleSave}>Save changes</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
{/if}
