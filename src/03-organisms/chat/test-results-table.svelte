<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import type { TabularData } from "$lib/stores/diagnostic-test-data";

    export let data: TabularData;
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
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root> 