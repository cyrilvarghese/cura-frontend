<script lang="ts">
    import { TestTube, Plus } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import ExaminationCard from "../../03-organisms/chat/chat-cards/examination-card.svelte";
    import TestResultCard from "../../03-organisms/chat/chat-cards/test-result-card.svelte";
    import AddPhysicalExamDialog from "../../03-organisms/dialogs/AddorEditPhysicalExamDialog.svelte";
    import type { FindingContent, TestResultContent } from "$lib/types/index";
    import { refreshTestData } from "$lib/stores/caseCreatorStore";

    const { testData, caseId } = $props<{
        testData: {
            physical_exam: Record<string, any>;
            lab_test: Record<string, any>;
        };
        caseId: string;
    }>();

    // State for dialog
    let addExamDialogOpen = $state(false);

    // Handle successful exam addition
    function handleExamAdded(examData: any) {
        console.log("New exam added:", examData);
        console.log("Refreshing test data for case:", caseId);
        // Refresh the data from API directly
        refreshTestData(caseId);
    }

    // Handle exam deletion
    function handleExamDeleted(examName: string) {
        console.log("Exam deleted:", examName);
        console.log("Refreshing test data for case:", caseId);
        // Refresh the data from API directly
        refreshTestData(caseId);
    }

    // Handle exam edit (when implemented)
    function handleExamEdited(examName: string, updatedData: any) {
        console.log("Exam edited:", examName);
        console.log("Refreshing test data for case:", caseId);
        // Refresh the data from API directly
        refreshTestData(caseId);
    }

    // Group physical exams by finding type
    function groupExamsByType(exams: Record<string, any>) {
        const groups = {
            text: [] as Array<[string, any]>,
            table: [] as Array<[string, any]>,
            image: [] as Array<[string, any]>,
            mixed: [] as Array<[string, any]>,
        };

        Object.entries(exams).forEach(([examName, examDetails]) => {
            const findings = examDetails.findings as FindingContent;
            if (
                findings &&
                typeof findings === "object" &&
                "type" in findings
            ) {
                groups[findings.type]?.push([examName, examDetails]);
            } else {
                // Default to text if type is not clear
                groups.text.push([examName, examDetails]);
            }
        });

        return groups;
    }

    // Group lab tests by result type
    function groupTestsByType(tests: Record<string, any>) {
        const groups = {
            text: [] as Array<[string, any]>,
            table: [] as Array<[string, any]>,
            image: [] as Array<[string, any]>,
            mixed: [] as Array<[string, any]>,
        };

        Object.entries(tests).forEach(([testName, testDetails]) => {
            const results = testDetails.results as TestResultContent;
            if (results && typeof results === "object" && "type" in results) {
                groups[results.type]?.push([testName, testDetails]);
            } else {
                // Default to text if type is not clear
                groups.text.push([testName, testDetails]);
            }
        });

        return groups;
    }

    const groupedExams = $derived(groupExamsByType(testData.physical_exam));
    const groupedTests = $derived(groupTestsByType(testData.lab_test));

    const typeLabels = {
        text: "Text Results",
        table: "Tabular Data",
        image: "Image Results",
        mixed: "Mixed Content",
    };

    const examTypeColors = {
        text: "text-blue-700",
        table: "text-green-700",
        image: "text-purple-700",
        mixed: "text-red-700",
    };

    const testTypeColors = {
        text: "text-amber-700",
        table: "text-emerald-700",
        image: "text-violet-700",
        mixed: "text-orange-700",
    };
</script>

<div class="space-y-16 p-6">
    <section class="space-y-8">
        <div
            class="flex items-center justify-start mb-8 border-b pb-4 border-gray-200 dark:border-gray-700"
        >
            <h2
                class="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3"
            >
                <TestTube class="h-6 w-6 text-primary" />
                Physical Examinations and Lab Tests
            </h2>
            <Button
                variant="outline"
                size="sm"
                class="gap-2 ml-6 text-blue-500 px-4 py-2"
                onclick={() => (addExamDialogOpen = true)}
            >
                <Plus class="h-4 w-4" />
                Add Physical Exam
            </Button>
        </div>

        <!-- Group examinations by type -->
        {#each Object.entries(groupedExams) as [type, exams]}
            {#if exams.length > 0}
                <div class="space-y-6">
                    <h3
                        class="text-lg font-semibold {examTypeColors[
                            type as keyof typeof examTypeColors
                        ]} flex items-center gap-2"
                    >
                        <span
                            class="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-600"
                        >
                            {exams.length}
                        </span>
                        {typeLabels[type as keyof typeof typeLabels]}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {#each exams as [examName, examDetails]}
                            {@const exam = examDetails as any}
                            <ExaminationCard
                                {caseId}
                                result={{
                                    name: examName,
                                    purpose: exam.purpose,
                                    findings: exam.findings,
                                    status: exam.status,
                                    interpretation: exam.interpretation,
                                    timestamp: new Date(),
                                    comments: exam.comments,
                                    isVerified: true,
                                }}
                                onDelete={handleExamDeleted}
                                onEdit={handleExamEdited}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    </section>

    <section class="space-y-8">
        <h3 class="text-xl pb-4 pt-6 font-semibold">Lab Tests</h3>

        <!-- Group lab tests by type -->
        {#each Object.entries(groupedTests) as [type, tests]}
            {#if tests.length > 0}
                <div class="space-y-6">
                    <h4
                        class="text-lg font-semibold {testTypeColors[
                            type as keyof typeof testTypeColors
                        ]} flex items-center gap-2"
                    >
                        <span
                            class="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-600"
                        >
                            {tests.length}
                        </span>
                        {typeLabels[type as keyof typeof typeLabels]}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {#each tests as [testName, testDetails]}
                            {@const test = testDetails as any}
                            <TestResultCard
                                {caseId}
                                result={{
                                    testName: testName,
                                    purpose: test.purpose,
                                    results: test.results,
                                    status: test.status,
                                    interpretation: test.interpretation,
                                    timestamp: new Date(),
                                    comments: test.comments,
                                    isVerified: true,
                                }}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    </section>
</div>

<!-- Add Physical Exam Dialog Component -->
<AddPhysicalExamDialog
    {caseId}
    bind:open={addExamDialogOpen}
    onSuccess={handleExamAdded}
/>
