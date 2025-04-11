<script lang="ts">
    import ExaminationCard from "../../03-organisms/chat/chat-cards/examination-card.svelte";
    import TestResultCard from "../../03-organisms/chat/chat-cards/test-result-card.svelte";
    export let testData: {
        physical_exam: Record<string, any>;
        lab_test: Record<string, any>;
    };
    export let caseId: string;
</script>

<div class="space-y-6">
    <section class="space-y-4">
        <h3 class="text-xl pb-4 pt-4 font-semibold">Physical Examinations</h3>
        {#each Object.entries(testData.physical_exam) as [examName, examDetails]}
            <ExaminationCard
                result={{
                    name: examName,
                    purpose: examDetails.purpose,
                    findings: examDetails.findings,
                    status: examDetails.status,
                    interpretation: examDetails.interpretation,
                    timestamp: new Date(),
                    comments: examDetails.comments,
                }}
            />
        {/each}
    </section>

    <section class="space-y-4">
        <h3 class="text-xl pb-4 pt-4 font-semibold">Lab Tests</h3>
        {#each Object.entries(testData.lab_test) as [testName, testDetails]}
            <TestResultCard
                {caseId}
                result={{
                    testName: testDetails.testName,
                    purpose: testDetails.purpose,
                    results: testDetails.results,
                    status: testDetails.status,
                    interpretation: testDetails.interpretation,
                    timestamp: new Date(),
                    comments: testDetails.comments,
                }}
            />
        {/each}
    </section>
</div>
