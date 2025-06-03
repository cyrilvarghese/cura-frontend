<script lang="ts">
    import { TestTube, Plus } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import ExaminationCard from "../../03-organisms/chat/chat-cards/examination-card.svelte";
    import TestResultCard from "../../03-organisms/chat/chat-cards/test-result-card.svelte";
    import AddorEditPhysicalExamDialog from "../../03-organisms/dialogs/AddorEditPhysicalExamDialog.svelte";
    import AddoeEditLabTestDialog from "../../03-organisms/dialogs/AddoeEditLabTestDialog.svelte";
    import type { FindingContent, TestResultContent } from "$lib/types/index";
    import { refreshTestData, caseStore } from "$lib/stores/caseCreatorStore";

    const { caseId } = $props<{
        caseId: string;
        testData?: {
            physical_exam: Record<string, any>;
            lab_test: Record<string, any>;
        };
    }>();

    // Subscribe to store for reactive data
    const storeData = $derived($caseStore);

    // Use store data if available, fallback to props
    const testData = $derived(
        storeData.testData || {
            physical_exam: {},
            lab_test: {},
        },
    );

    // State for dialog
    let addExamDialogOpen = $state(false);
    let editExamDialogOpen = $state(false);
    let editExamData = $state<any>(null);
    let addLabTestDialogOpen = $state(false);
    let editLabTestDialogOpen = $state(false);
    let editLabTestData = $state<any>(null);

    // Loading state for data refresh
    let isRefreshing = $state(false);

    // Helper function to handle refresh with loading state
    async function handleDataRefresh(action: string) {
        console.log(`${action} - Refreshing test data for case:`, caseId);
        isRefreshing = true;
        try {
            await refreshTestData(caseId);
        } finally {
            isRefreshing = false;
        }
    }

    // Handle successful exam addition
    function handleExamAdded(examData: any) {
        console.log("New exam added:", examData);
        handleDataRefresh("Exam added");
    }

    // Handle exam deletion
    function handleExamDeleted(examName: string) {
        console.log("Exam deleted:", examName);
        handleDataRefresh("Exam deleted");
    }

    // Handle exam edit (when implemented)
    function handleExamEdited(examName: string, examData: any) {
        console.log("Opening edit dialog for exam:", examName);
        editExamData = examData;
        editExamDialogOpen = true;
    }

    // Handle successful exam update
    function handleExamUpdated(examData: any) {
        console.log("Exam updated:", examData);
        handleDataRefresh("Exam updated");
        editExamDialogOpen = false;
        editExamData = null;
    }

    // Handle lab test deletion
    function handleLabTestDeleted(testName: string) {
        console.log("Lab test deleted:", testName);
        handleDataRefresh("Lab test deleted");
    }

    // Handle lab test edit (when implemented)
    function handleLabTestEdited(testName: string, testData: any) {
        console.log("Opening edit dialog for lab test:", testName);
        editLabTestData = testData;
        editLabTestDialogOpen = true;
    }

    // Handle lab test addition (placeholder for future implementation)
    function handleAddLabTest() {
        addLabTestDialogOpen = true;
    }

    // Handle successful lab test addition
    function handleLabTestAdded(testName: string, testData: any) {
        console.log("New lab test added:", testData);
        handleDataRefresh("Lab test added");
    }

    // Handle successful lab test update
    function handleLabTestUpdated(testName: string, testData: any) {
        console.log("Lab test updated:", testData);
        handleDataRefresh("Lab test updated");
        editLabTestDialogOpen = false;
        editLabTestData = null;
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
        <div
            class="flex items-center justify-start mb-8 border-b pb-4 border-gray-200 dark:border-gray-700"
        >
            <h3
                class="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3"
            >
                Lab Tests
            </h3>
            <Button
                variant="outline"
                size="sm"
                class="gap-2 ml-6 text-amber-600 px-4 py-2"
                onclick={handleAddLabTest}
            >
                <Plus class="h-4 w-4" />
                Add Lab Test
            </Button>
        </div>

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
                                onDelete={handleLabTestDeleted}
                                onEdit={handleLabTestEdited}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    </section>
</div>

<!-- Add Physical Exam Dialog Component -->
<AddorEditPhysicalExamDialog
    {caseId}
    bind:open={addExamDialogOpen}
    onSuccess={handleExamAdded}
/>

<!-- Edit Physical Exam Dialog Component -->
<AddorEditPhysicalExamDialog
    {caseId}
    bind:open={editExamDialogOpen}
    editData={editExamData}
    onSuccess={handleExamUpdated}
/>

<!-- Add Lab Test Dialog Component -->
<AddoeEditLabTestDialog
    {caseId}
    bind:open={addLabTestDialogOpen}
    onSuccess={handleLabTestAdded}
/>

<!-- Edit Lab Test Dialog Component -->
<AddoeEditLabTestDialog
    {caseId}
    bind:open={editLabTestDialogOpen}
    editData={editLabTestData}
    onSuccess={handleLabTestUpdated}
/>

<!-- Loading Overlay for Data Refresh -->
<LoadingOverlay message="Refreshing data..." isVisible={isRefreshing} />
