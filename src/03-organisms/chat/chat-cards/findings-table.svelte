<script lang="ts">
    import Edit from "lucide-svelte/icons/edit";
    import { Button } from "$lib/components/ui/button";
    import type { TabularData } from "$lib/types";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Table from "$lib/components/ui/table";
    import { editPhysicalExamTableStore } from "$lib/stores/editTablePEStore";
    import { Trash2 } from "lucide-svelte";

    const {
        data: propData,
        caseId,
        testName,
        testType,
    } = $props<{
        data: TabularData;
        caseId: string;
        testName: string;
        testType: string;
    }>();

    // Create a local reactive copy of the data
    let localData = $state<TabularData>({
        headers: [...propData.headers],
        rows: propData.rows.map((row: (string | number)[]) => [...row]),
    });

    let showEditDialog = $state(false);
    let editingRow = $state<(string | number)[] | null>(null);
    let editingRowIndex = $state(-1); // Track the index of the row being edited

    function handleEdit(row: (string | number)[], index: number) {
        editingRow = [...row];
        editingRowIndex = index; // Store the index of the row being edited
        showEditDialog = true;
    }

    async function handleSave() {
        if (editingRow) {
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
            editingRowIndex = -1; // Reset the editing index
        }
    }

    function handleAddRow() {
        // Create an empty row with the correct number of columns
        const emptyRow = Array(localData.headers.length).fill("");

        // Add the empty row to the data
        localData.rows = [...localData.rows, emptyRow];

        // Optionally, immediately open the edit dialog for the new row
        editingRow = emptyRow;
        editingRowIndex = localData.rows.length - 1;
        showEditDialog = true;
    }

    async function handleDelete(index: number) {
        if (confirm("Are you sure you want to delete this row?")) {
            // Get the parameter name (row identifier) from the first column
            const rowIdentifier = localData.rows[index][0].toString();

            // Call the API to delete the row
            const success = await editPhysicalExamTableStore.deleteRow(
                caseId,
                testName,
                testType,
                rowIdentifier,
            );

            if (success) {
                // Remove the row from the local data if API call was successful
                localData.rows = localData.rows.filter((_, i) => i !== index);

                // Close the edit dialog if it's open
                if (showEditDialog) {
                    showEditDialog = false;
                    editingRow = null;
                    editingRowIndex = -1;
                }
            }
        }
    }
</script>

<div class="flex justify-between items-center mb-4">
    <h4 class="ml-4 font-medium leading-none text-blue-900">Results</h4>

    <button
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onclick={handleAddRow}
    >
        Add Row
    </button>
</div>

<Table.Root>
    <Table.Header>
        <Table.Row>
            {#each localData.headers as header}
                <Table.Head>{header}</Table.Head>
            {/each}
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each localData.rows as row, index}
            <Table.Row>
                {#each row as cell}
                    <Table.Cell>{cell}</Table.Cell>
                {/each}
                <Table.Cell>
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
                {#each localData.headers as header, index}
                    <div class="grid grid-cols-4 items-center gap-4">
                        <label
                            for={`field-${index}`}
                            class="text-right text-sm font-medium"
                        >
                            {header}
                        </label>
                        {#if index === 0 && editingRowIndex !== null && editingRowIndex < localData.rows.length - 1}
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
                onclick={() => {
                    // If we're editing the last row and it's empty, remove it
                    if (
                        editingRowIndex === localData.rows.length - 1 &&
                        editingRow?.every((cell) => cell === "")
                    ) {
                        localData.rows = localData.rows.slice(0, -1);
                    }

                    showEditDialog = false;
                    editingRow = null;
                    editingRowIndex = -1;
                }}
            >
                Cancel
            </Button>
            <Button onclick={handleSave}>Save changes</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
