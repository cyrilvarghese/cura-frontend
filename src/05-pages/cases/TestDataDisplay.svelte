<script lang="ts">
    import { TestTube } from "lucide-svelte";
    import ExaminationCard from "../../03-organisms/chat/chat-cards/examination-card.svelte";
    import TestResultCard from "../../03-organisms/chat/chat-cards/test-result-card.svelte";
    export let testData: {
        physical_exam: Record<string, any>;
        lab_test: Record<string, any>;
    };
    export let caseId: string;
</script>

<div class="space-y-8">
    <section class="space-y-4">
        <h2
            class="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center gap-2"
        >
            <TestTube class="h-6 w-6 text-primary" />
            Physical Examinations and Lab Tests
        </h2>
        {#each Object.entries(testData.physical_exam) as [examName, examDetails]}
            <ExaminationCard
                {caseId}
                result={{
                    name: examName,
                    purpose: examDetails.purpose,
                    findings: examDetails.findings,
                    status: examDetails.status,
                    interpretation: examDetails.interpretation,
                    timestamp: new Date(),
                    comments: examDetails.comments,
                    isVerified: true,
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
                    testName: testName,
                    purpose: testDetails.purpose,
                    results: testDetails.results,
                    status: testDetails.status,
                    interpretation: testDetails.interpretation,
                    timestamp: new Date(),
                    comments: testDetails.comments,
                    isVerified: true,
                }}
            />
        {/each}
    </section>
</div>
