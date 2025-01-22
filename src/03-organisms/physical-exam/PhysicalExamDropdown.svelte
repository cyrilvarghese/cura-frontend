<script lang="ts">
    import { caseDataStore } from '$lib/stores/casePlayerStore';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Button } from '$lib/components/ui/button';
    import ScanEye from 'lucide-svelte/icons/scan-eye';
    import type { ExaminationName } from '$lib/types';

    let { onExamination } = $props<{
        onExamination: (examName: ExaminationName) => void;
    }>();

    let physicalExamNames = $state<ExaminationName[]>([]);

    // Subscribe to caseDataStore changes
    $effect(() => {
        if ($caseDataStore?.physicalExamReports) {
            physicalExamNames = Object.keys($caseDataStore.physicalExamReports) as ExaminationName[];
        }
    });

    function handleExamination(examName: ExaminationName) {
        onExamination(examName);
    }
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button
                variant="ghost"
                size="default"
                 
                {...props}
            >
                <ScanEye class="h-5 w-5" />
                <p>Physical Exam</p>
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content class="w-72">
        <DropdownMenu.Label>Physical Examination</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
            {#each physicalExamNames as examName}
                <DropdownMenu.Item
                    onclick={() => handleExamination(examName)}
                >
                    {examName}
                </DropdownMenu.Item>
            {/each}
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root> 