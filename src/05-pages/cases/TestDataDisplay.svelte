<script lang="ts">
    import ExaminationCard from "../../03-organisms/chat/chat-cards/examination-card.svelte";
    import TestResultCard from "../../03-organisms/chat/chat-cards/test-result-card.svelte";
    import RelevantInfoCard from "../../03-organisms/chat/chat-cards/relevant-info-card.svelte";
    import { get } from "svelte/store";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    export let testData: {
        physical_exam: Record<string, any>;
        lab_test: Record<string, any>;
    };
    export let caseId: string = get(currentCaseId) ?? get(lastCaseIdStore) ?? "";

</script>

<div class="space-y-6">

    <section>
        <h3 class="text-xl pb-4 pt-4 font-semibold">Physical Examinations</h3>
        {#each Object.entries(testData.physical_exam) as [examName, examDetails]}
            <ExaminationCard
                caseId={caseId}
                result={{
                    name: examName,
                    purpose: examDetails.purpose,
                    findings: examDetails.findings,
                    status: examDetails.status,
                    interpretation: examDetails.interpretation,
                    timestamp: new Date()
                }}
            />
        {/each}
    </section>

    <section>
        <h3 class="text-xl pb-4 pt-4 font-semibold">Lab Tests</h3>
        {#each Object.entries(testData.lab_test) as [testName, testDetails]}
            <TestResultCard
                caseId={caseId}
                result={{
                    testName: testDetails.testName,
                    purpose: testDetails.purpose,
                    results: testDetails.results,
                    status: testDetails.status,
                    interpretation: testDetails.interpretation,
                    timestamp: new Date()
                }}
            />
        {/each}
    </section>
</div> 