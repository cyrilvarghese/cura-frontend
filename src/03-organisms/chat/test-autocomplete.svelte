<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import Check from "lucide-svelte/icons/check";
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils";
    import { onMount, onDestroy } from "svelte";
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
    import { caseDataStore } from "$lib/stores/casePlayerStore";
    import CircleAlert from "lucide-svelte/icons/circle-alert";

    // Import all test data
    import physicalExams from "$lib/data/physical_exam.json";
    import labTests from "$lib/data/lab_test.json";
    import { ScanEye, TestTubeDiagonal } from "lucide-svelte";

    const { caseId, currentStep } = $props<{
        caseId?: string;
        currentStep?: string;
    }>();

    // Define initialValue object containing all default state values
    const initialValue = {
        // Lab tests state
        openLabTests: false,
        valueLabTests: "",
        labTestsArray: [],

        // Physical exams state
        openPhysicalExams: false,
        valuePhysicalExams: "",
        physicalExamsArray: [],

        // Shared state
        validationResult: null,
        isValidating: false,
        isOrdering: false,

        // Alert dialog state
        showAlertDialog: false,
        alertDialogMessage: "",
        alertDialogTitle: "",
    };

    // State for lab tests autocomplete
    let openLabTests = $state(initialValue.openLabTests);
    let valueLabTests = $state(initialValue.valueLabTests);
    let triggerRefLabTests = $state<HTMLButtonElement>(null!);
    let labTestsArray = $state<string[]>(initialValue.labTestsArray);

    // State for physical exams autocomplete
    let openPhysicalExams = $state(initialValue.openPhysicalExams);
    let valuePhysicalExams = $state(initialValue.valuePhysicalExams);
    let triggerRefPhysicalExams = $state<HTMLButtonElement>(null!);
    let physicalExamsArray = $state<string[]>(initialValue.physicalExamsArray);

    // Shared state
    let validationResult = $state<TestValidationResponse | null>(
        initialValue.validationResult,
    );
    let isValidating = $state(initialValue.isValidating);
    let isOrdering = $state(initialValue.isOrdering);

    // Alert dialog state
    let showAlertDialog = $state(initialValue.showAlertDialog);
    let alertDialogMessage = $state(initialValue.alertDialogMessage);
    let alertDialogTitle = $state(initialValue.alertDialogTitle);

    // Derived values
    const selectedValueLabTests = $derived(
        valueLabTests ? valueLabTests : "Lab Tests",
    );
    const selectedValuePhysicalExams = $derived(
        valuePhysicalExams ? valuePhysicalExams : "Physical Exams",
    );

    // Get and monitor case data changes
    const initialCaseData = $caseDataStore;
    console.log("Initial Case Data:", initialCaseData);

    $effect(() => {
        if (
            $caseDataStore?.labTestReports &&
            $caseDataStore?.physicalExamReports &&
            labTestsArray.length === 0 &&
            physicalExamsArray.length === 0
        ) {
            debugger;
            // Convert all lab tests to uppercase and deduplicate
            const labTestsUppercase = labTests.map((test) =>
                test.toUpperCase(),
            );
            const caseLabTestsUppercase = Object.keys(
                $caseDataStore.labTestReports,
            ).map((test) => test.toUpperCase());

            // Combine and deduplicate using Set
            labTestsArray = [
                ...new Set([...labTestsUppercase, ...caseLabTestsUppercase]),
            ];

            // Same for physical exams - convert to uppercase and deduplicate
            const physicalExamsUppercase = physicalExams.map((exam) =>
                exam.toUpperCase(),
            );
            const casePhysicalExamsUppercase = Object.keys(
                $caseDataStore.physicalExamReports,
            ).map((exam) => exam.toUpperCase());

            // Combine and deduplicate
            physicalExamsArray = [
                ...new Set([
                    ...physicalExamsUppercase,
                    ...casePhysicalExamsUppercase,
                ]),
            ];

            // Sort the two arrays alphabetically
            labTestsArray.sort();
            physicalExamsArray.sort();

            console.log("Case Data Updated:", $caseDataStore);
        }
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

    // Function to reset component state
    function resetComponentState() {
        // Reset lab tests state
        openLabTests = initialValue.openLabTests;
        valueLabTests = initialValue.valueLabTests;
        labTestsArray = initialValue.labTestsArray;

        // Reset physical exams state
        openPhysicalExams = initialValue.openPhysicalExams;
        valuePhysicalExams = initialValue.valuePhysicalExams;
        physicalExamsArray = initialValue.physicalExamsArray;

        // Reset shared state
        validationResult = initialValue.validationResult;
        isValidating = initialValue.isValidating;
        isOrdering = initialValue.isOrdering;

        // Reset alert dialog state
        showAlertDialog = initialValue.showAlertDialog;
        alertDialogMessage = initialValue.alertDialogMessage;
        alertDialogTitle = initialValue.alertDialogTitle;

        console.log("Component state has been reset");
    }

    onMount(() => {
        // Reset component state when mounted
        resetComponentState();

        if (triggerRefLabTests) {
            triggerRefLabTests.focus();
        }

        // Log the current step value
        console.log("Current Step:", currentStep);

        // Add keyboard event listener
        document.addEventListener("keydown", handleKeydown);
    });

    onDestroy(() => {
        // Remove keyboard event listener when component is destroyed
        document.removeEventListener("keydown", handleKeydown);
    });

    // Handle keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        // Ctrl+P for Physical Exams
        if (event.ctrlKey && event.key === "p") {
            event.preventDefault();
            openPhysicalExams = true;
            tick().then(() => {
                const input = document.querySelector(
                    '[placeholder="SEARCH FOR A PHYSICAL EXAM..."]',
                ) as HTMLInputElement;
                if (input) input.focus();
            });
        }

        // Ctrl+L for Lab Tests
        if (event.ctrlKey && event.key === "l") {
            event.preventDefault();

            // Don't open if in a step that doesn't allow it
            if (
                currentStep === "relevant-info" ||
                currentStep === "diagnosis"
            ) {
                // Show alert dialog instead
                const title =
                    currentStep === "relevant-info"
                        ? "Submit Postive Clinical Findings First"
                        : "Submit Initial Diagnosis First";

                const message =
                    currentStep === "relevant-info"
                        ? "You'll need to submit relevant clinical findings before ordering tests!"
                        : "You'll need to submit an initial diagnosis before ordering tests!";

                alertDialogTitle = title;
                alertDialogMessage = message;
                showAlertDialog = true;
                return;
            }

            openLabTests = true;
            tick().then(() => {
                const input = document.querySelector(
                    '[placeholder="SEARCH FOR A LAB TEST..."]',
                ) as HTMLInputElement;
                if (input) input.focus();
            });
        }
    }

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

<div class=" space-y-4 w-[500px]" id="test-autocomplete-container">
    <!-- Alert Dialog Component -->
    <AlertDialog.Root bind:open={showAlertDialog}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>{alertDialogTitle}</AlertDialog.Title>
                <AlertDialog.Description>
                    {alertDialogMessage}
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Cancel>Ok</AlertDialog.Cancel>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>

    <!-- Autocompletes in the same row -->
    <div class="flex gap-4 justify-end">
        <!-- Physical Exams Autocomplete -->
        <div>
            <!-- <h3 class="text-sm font-medium mb-2">Physical Exams</h3> -->
            <Popover.Root bind:open={openPhysicalExams}>
                <Popover.Trigger bind:ref={triggerRefPhysicalExams}>
                    {#snippet child({ props })}
                        <Button
                            variant="ghost"
                            class={cn(
                                "w-full justify-between focus-visible:ring-0 bg-blue-100 cursor-pointer focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent focus-visible:ring-offset-background shadow-none hover:bg-blue-200 hover:no-underline ring-offset-0",
                                openPhysicalExams && "text-blue-500",
                            )}
                            {...props}
                            aria-expanded={openPhysicalExams}
                        >
                            <p
                                class="hover:underline text-blue-600 flex items-center"
                            >
                                <ScanEye class="h-5 w-5 mr-2" />
                                <span class=" truncate text-left">
                                    {selectedValuePhysicalExams}
                                </span>
                            </p>
                            <span class="text-xs text-blue-400 ml-1"
                                >(Ctrl+P)</span
                            >
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
        <!-- <p class="text-gray-500 pt-2">|</p> -->
        <!-- Lab Tests Autocomplete -->
        <div>
            <!-- <h3 class="text-sm font-medium mb-2">Lab Tests</h3> -->
            <Popover.Root
                bind:open={openLabTests}
                onOpenChange={(open) => {
                    if (currentStep === "relevant-info") {
                        if (open) {
                            console.log(
                                "Lab Tests Popover opened, Current Step:",
                                currentStep,
                            );
                            // Show alert dialog instead
                            alertDialogTitle =
                                "Submit Postive Clinical Findings First";
                            alertDialogMessage =
                                "You'll need to submit relevant clinical findings before ordering tests!";
                            showAlertDialog = true;
                            openLabTests = false; // Prevent popover from opening
                        }
                    }
                    if (currentStep === "diagnosis") {
                        if (open) {
                            console.log(
                                "Lab Tests Popover opened, Current Step:",
                                currentStep,
                            );
                            // Show alert dialog instead
                            alertDialogTitle = "Submit Initial Diagnosis First";
                            alertDialogMessage =
                                "You'll need to submit an initial diagnosis before ordering tests!";
                            showAlertDialog = true;
                            openLabTests = false; // Prevent popover from opening
                        }
                    }
                }}
            >
                <Popover.Trigger bind:ref={triggerRefLabTests}>
                    {#snippet child({ props })}
                        <Button
                            variant="ghost"
                            class={cn(
                                "w-full bg-blue-100 justify-between cursor-pointer hover:bg-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent focus-visible:ring-offset-background shadow-none ring-offset-0",
                                openLabTests && "text-blue-500",
                            )}
                            {...props}
                            aria-expanded={openLabTests}
                        >
                            <p
                                class="hover:underline text-blue-600 flex items-center"
                            >
                                <TestTubeDiagonal class="h-5 w-5 mr-2" />
                                <span class="truncate text-left">
                                    {selectedValueLabTests}
                                </span>
                            </p>
                            <span class="text-xs text-blue-400 ml-1"
                                >(Ctrl+L)</span
                            >
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
    </div>
</div>
