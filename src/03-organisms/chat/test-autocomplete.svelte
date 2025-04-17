<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import Check from "lucide-svelte/icons/check";
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { cn } from "$lib/utils";
    import { onMount } from "svelte";
    import type {
        DiagnosticTestName,
        ExaminationName,
        ExaminationResult,
        TestResult,
    } from "$lib/types/index";
    import { testValidatorStore } from "$lib/stores/testValidatorStore";
    import type { TestValidationResponse } from "$lib/services/testValidatorService";
    import { laboratoryStore } from "$lib/stores/labTestStore";
    import { examinationStore } from "$lib/stores/examinationStore";
    import { sendMessage } from "$lib/stores/apiStore";

    // Import all test data
    import physicalExams from "$lib/data/physical_exam.json";
    import labTests from "$lib/data/lab_test.json";
    import { ScanEye, TestTubeDiagonal } from "lucide-svelte";
    import { caseDataStore } from "$lib/stores/casePlayerStore";

    const { caseId } = $props<{
        caseId?: string;
    }>();

    // State for lab tests autocomplete
    let openLabTests = $state(false);
    let valueLabTests = $state("");
    let triggerRefLabTests = $state<HTMLButtonElement>(null!);

    // State for physical exams autocomplete
    let openPhysicalExams = $state(false);
    let valuePhysicalExams = $state("");
    let triggerRefPhysicalExams = $state<HTMLButtonElement>(null!);

    // Shared state
    let validationResult = $state<TestValidationResponse | null>(null);
    let isValidating = $state(false);
    let isOrdering = $state(false);

    // Derived values
    const selectedValueLabTests = $derived(
        valueLabTests ? valueLabTests : "Order Lab Test...",
    );
    const selectedValuePhysicalExams = $derived(
        valuePhysicalExams ? valuePhysicalExams : "Order Physical Exam...",
    );

    // Get initial case data
    const initialCaseData = $caseDataStore;

    // Initialize arrays directly without filtering
    const labTestsArray = [
        ...new Set([
            ...labTests,
            ...Object.keys(initialCaseData?.labTestReports || {}),
        ]),
    ];
    const physicalExamsArray = [
        ...new Set([
            ...physicalExams,
            ...Object.keys(initialCaseData?.physicalExamReports || {}),
        ]),
    ];

    onMount(() => {
        console.log("Filtered Lab Tests:", labTestsArray);
        console.log("Filtered Physical Exams:", physicalExamsArray);
    });

    // Close lab tests popover and refocus trigger button
    function closeAndFocusLabTestsTrigger() {
        openLabTests = false;
        tick().then(() => {
            triggerRefLabTests?.focus();
        });
    }

    // Close physical exams popover and refocus trigger button
    function closeAndFocusPhysicalExamsTrigger() {
        openPhysicalExams = false;
        tick().then(() => {
            triggerRefPhysicalExams?.focus();
        });
    }

    onMount(() => {
        if (triggerRefLabTests) {
            triggerRefLabTests.focus();
            let labTestData = $caseDataStore?.labTestReports;
            let examData = $caseDataStore?.physicalExamReports;
        }
    });

    // Handle lab test selection
    async function handleSelectLabTest(testName: string) {
        valueLabTests = testName.toUpperCase();
        closeAndFocusLabTestsTrigger();

        isValidating = true;
        try {
            // Find the exact test name with correct casing from the original list
            const exactTestName =
                labTests.find(
                    (test) => test.toLowerCase() === testName.toLowerCase(),
                ) || testName;

            const result = await testValidatorStore.validateTest(
                exactTestName as DiagnosticTestName,
                "lab_test",
                caseId,
            );
            validationResult = result;
            console.log("Test validation result:", result);

            isOrdering = true;
            try {
                let testToOrder;
                let generatedData = null;
                let isVerified = false;

                if (result.result.match && result.result.matched_test) {
                    // If match is true, use the matched_test value
                    testToOrder = result.result.matched_test;
                    isVerified = true;
                } else if (result.result.generated_data) {
                    // If match is false but we have generated data, use that
                    testToOrder = result.result.generated_data.testName;
                    generatedData = result.result.generated_data;
                } else {
                    // Fallback to the original test name
                    testToOrder = exactTestName;
                }

                console.log("Ordering lab test:", testToOrder);

                // Order the test with generated data if available
                const labResult = await laboratoryStore.orderTest(
                    testToOrder as DiagnosticTestName,
                    generatedData,
                );

                if (labResult) {
                    // Create and send message
                    const message = {
                        id: crypto.randomUUID(),
                        sender: "assistant",
                        content: {
                            testName: labResult.testName,
                            purpose: labResult.purpose,
                            status: labResult.status,
                            results: labResult.results,
                            interpretation:
                                labResult.interpretation ||
                                "Results are being analyzed.",
                            timestamp: labResult.timestamp,
                            comments: labResult.comments,
                            isVerified: isVerified,
                        },
                        timestamp: new Date(),
                        type: "test-result",
                    };
                    await sendMessage(
                        message.content as TestResult,
                        "assistant",
                        "examination",
                        "test-result",
                    );
                }
                console.log("Lab test result:", labResult);
            } catch (error) {
                console.error("Error ordering lab test:", error);
            } finally {
                isOrdering = false;
            }
        } catch (error) {
            console.error("Error validating test:", error);
        } finally {
            isValidating = false;
            valueLabTests = ""; // Reset after ordering
        }
    }

    // Handle physical exam selection
    async function handleSelectPhysicalExam(examName: string) {
        valuePhysicalExams = examName.toUpperCase();
        closeAndFocusPhysicalExamsTrigger();

        isValidating = true;
        try {
            // Find the exact exam name with correct casing from the original list
            const exactExamName =
                physicalExams.find(
                    (exam) => exam.toLowerCase() === examName.toLowerCase(),
                ) || examName;

            const result = await testValidatorStore.validateTest(
                exactExamName as DiagnosticTestName,
                "physical_exam",
                caseId,
            );
            validationResult = result;
            console.log("Exam validation result:", result);

            isOrdering = true;
            try {
                let examToPerform;
                let generatedData = null;
                let isVerified = false;

                if (result.result.match && result.result.matched_test) {
                    // If match is true, use the matched_test value
                    examToPerform = result.result.matched_test;
                    isVerified = true;
                } else if (result.result.generated_data) {
                    // If match is false but we have generated data, use that
                    examToPerform = result.test_name;
                    generatedData = result.result.generated_data;
                } else {
                    // Fallback to the original exam name
                    examToPerform = exactExamName;
                }

                if (result.result.match && result.result.matched_test) {
                    // If match is true, use the matched_test value
                    examToPerform = result.result.matched_test;
                    isVerified = true;
                } else if (result.result.generated_data) {
                    // If match is false but we have generated data, use that
                    examToPerform = result.test_name;
                    generatedData = result.result.generated_data;
                } else {
                    // Fallback to the original exam name
                    examToPerform = exactExamName;
                }

                console.log("Performing physical exam:", examToPerform);

                // Perform the physical exam with generated data if available
                const examResult = await examinationStore.performPhysicalExam(
                    examToPerform as ExaminationName,
                    generatedData,
                );

                if (examResult) {
                    // Add verification status to the content
                    const content = {
                        name: examResult.name,
                        purpose: examResult.purpose,
                        findings: examResult.findings,
                        timestamp: examResult.timestamp,
                        status: examResult.status,
                        interpretation: examResult.interpretation,
                        comments: examResult.comments,
                        isVerified: isVerified, // Add verification flag
                    };

                    // Create and send message
                    await sendMessage(
                        content as ExaminationResult,
                        "assistant",
                        "examination",
                        "examination",
                    );
                }
                console.log("Physical exam result:", examResult);
            } catch (error) {
                console.error("Error performing physical exam:", error);
            } finally {
                isOrdering = false;
            }
        } catch (error) {
            console.error("Error validating exam:", error);
        } finally {
            isValidating = false;
            valuePhysicalExams = ""; // Reset after ordering
        }
    }
</script>

<div class="relative space-y-4">
    <!-- Autocompletes in the same row -->
    <div class="flex gap-4">
        <!-- Lab Tests Autocomplete -->
        <div class="flex-1">
            <!-- <h3 class="text-sm font-medium mb-2">Lab Tests</h3> -->
            <Popover.Root bind:open={openLabTests}>
                <Popover.Trigger bind:ref={triggerRefLabTests}>
                    {#snippet child({ props })}
                        <Button
                            variant="outline"
                            class="w-full justify-between"
                            {...props}
                            role="combobox"
                            aria-expanded={openLabTests}
                        >
                            <TestTubeDiagonal class="h-5 w-5" />
                            {selectedValueLabTests}
                            <ChevronsUpDown
                                class="ml-2 h-4 w-4 shrink-0 opacity-50"
                            />
                        </Button>
                    {/snippet}
                </Popover.Trigger>
                <Popover.Content class="w-[300px] p-0">
                    <Command.Root>
                        <Command.Input
                            placeholder="SEARCH FOR A LAB TEST..."
                            class="h-9"
                        />
                        <Command.List class="max-h-[300px] overflow-y-auto">
                            <Command.Empty>No test found.</Command.Empty>
                            <Command.Group>
                                {#each labTestsArray as test}
                                    <Command.Item
                                        value={test}
                                        onSelect={() =>
                                            handleSelectLabTest(test)}
                                    >
                                        <Check
                                            class={cn(
                                                "mr-2 h-4 w-4",
                                                valueLabTests.toLowerCase() !==
                                                    test.toLowerCase() &&
                                                    "text-transparent",
                                            )}
                                        />
                                        {test.toUpperCase()}
                                    </Command.Item>
                                {/each}
                            </Command.Group>
                        </Command.List>
                    </Command.Root>
                </Popover.Content>
            </Popover.Root>
        </div>

        <!-- Physical Exams Autocomplete -->
        <div class="flex-1">
            <!-- <h3 class="text-sm font-medium mb-2">Physical Exams</h3> -->
            <Popover.Root bind:open={openPhysicalExams}>
                <Popover.Trigger bind:ref={triggerRefPhysicalExams}>
                    {#snippet child({ props })}
                        <Button
                            variant="outline"
                            class="w-full justify-between"
                            {...props}
                            role="combobox"
                            aria-expanded={openPhysicalExams}
                        >
                            <ScanEye class="h-5 w-5" />
                            {selectedValuePhysicalExams}
                            <ChevronsUpDown
                                class="ml-2 h-4 w-4 shrink-0 opacity-50"
                            />
                        </Button>
                    {/snippet}
                </Popover.Trigger>
                <Popover.Content class="w-[300px] p-0">
                    <Command.Root>
                        <Command.Input
                            placeholder="SEARCH FOR A PHYSICAL EXAM..."
                            class="h-9"
                        />
                        <Command.List class="max-h-[300px] overflow-y-auto">
                            <Command.Empty>No exam found.</Command.Empty>
                            <Command.Group>
                                {#each physicalExamsArray as exam}
                                    <Command.Item
                                        value={exam}
                                        onSelect={() =>
                                            handleSelectPhysicalExam(exam)}
                                    >
                                        <Check
                                            class={cn(
                                                "mr-2 h-4 w-4",
                                                valuePhysicalExams.toLowerCase() !==
                                                    exam.toLowerCase() &&
                                                    "text-transparent",
                                            )}
                                        />
                                        {exam.toUpperCase()}
                                    </Command.Item>
                                {/each}
                            </Command.Group>
                        </Command.List>
                    </Command.Root>
                </Popover.Content>
            </Popover.Root>
        </div>
    </div>

    <!-- Validation Result Display -->
    <!-- {#if validationResult}
        <div class="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 class="font-medium">
                Test Result: {validationResult.test_name.toUpperCase()}
            </h3>
            <p class="text-sm text-gray-600">
                {validationResult.result.match
                    ? "Test matched"
                    : validationResult.result.reason}
            </p>

            {#if validationResult.test_data || validationResult.result.generated_data}
                <div class="mt-2">
                    <p class="text-sm">
                        <span class="font-medium">Purpose:</span>
                        {validationResult.result.match
                            ? validationResult.test_data.purpose
                            : validationResult.result.generated_data?.purpose ||
                              "No purpose available"}
                    </p>

                    {#if (validationResult.result.match && validationResult.test_data.results?.type === "table") || (!validationResult.result.match && validationResult.result.generated_data?.results?.type === "table")}
                        <div class="mt-2 overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead>
                                    <tr>
                                        {#each validationResult.result.match ? validationResult.test_data.results.content.headers : validationResult.result.generated_data.results.content.headers as header}
                                            <th
                                                class="px-2 py-1 border bg-gray-100"
                                                >{header}</th
                                            >
                                        {/each}
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each validationResult.result.match ? validationResult.test_data.results.content.rows : validationResult.result.generated_data.results.content.rows as row}
                                        <tr>
                                            {#each row as cell}
                                                <td class="px-2 py-1 border"
                                                    >{cell}</td
                                                >
                                            {/each}
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else if (validationResult.result.match && validationResult.test_data.results?.type === "text") || (!validationResult.result.match && validationResult.result.generated_data?.results?.type === "text")}
                        <div class="mt-2">
                            <p class="text-sm">
                                <span class="font-medium">Result:</span>
                                {validationResult.result.match
                                    ? validationResult.test_data.results.content
                                    : validationResult.result.generated_data
                                          .results.content}
                            </p>
                        </div>
                    {/if}

                    <p class="mt-2 text-sm">
                        <span class="font-medium">Interpretation:</span>
                        {validationResult.result.match
                            ? validationResult.test_data.interpretation
                            : validationResult.result.generated_data
                                  ?.interpretation ||
                              "No interpretation available"}
                    </p>
                </div>
            {/if}
        </div>
    {/if} -->
</div>
