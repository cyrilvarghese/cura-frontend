<script lang="ts">
    import { caseDataStore } from '$lib/stores/caseDataStore';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import TestTubeDiagonal from 'lucide-svelte/icons/test-tube-diagonal';
    import type { DiagnosticTestName } from '$lib/types';

    let { onOrderTest } = $props<{
        onOrderTest: (testName: DiagnosticTestName) => void;
    }>();

    let labTestReportNames = $state<DiagnosticTestName[]>([]);

    // Subscribe to caseDataStore changes using $ syntax
    $effect(() => {
        console.log("caseDataStore changed");
        if ($caseDataStore?.labTestReports) {
            labTestReportNames = Object.keys($caseDataStore.labTestReports) as DiagnosticTestName[];
        }
    });

    function handleLabTest(testName: DiagnosticTestName) {
        onOrderTest(testName);
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 p-0"
                {...props}
            >
                <TestTubeDiagonal class="h-5 w-5" />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-72">
        <DropdownMenu.Label>Laboratory Tests</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
            {#each labTestReportNames as testName}
                <DropdownMenu.Item
                    onclick={() => handleLabTest(testName)}
                >
                    {testName}
                </DropdownMenu.Item>
            {/each}
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root> 