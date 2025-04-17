<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { sendMessage } from "$lib/stores/apiStore";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { examinationStore } from "$lib/stores/examinationStore";
    import { laboratoryStore } from "$lib/stores/labTestStore";
    import type { ExaminationName, TestResult } from "$lib/types/index";
    import type { DiagnosticTestName } from "$lib/types/index";
    import type { ExaminationResult } from "$lib/types/index";
    import LabTestsDropdown from "../lab-tests/LabTestsDropdown.svelte";
    import PhysicalExamDropdown from "../physical-exam/PhysicalExamDropdown.svelte";
    import { onMount } from "svelte";
    import TestAutocomplete from "./test-autocomplete.svelte";

    let textValue = $state("");
    let isLoading = $state(false);
    const { caseId } = $props<{ caseId: string }>();
    let textareaRef = $state<null | HTMLTextAreaElement>(null);
    async function handleSend() {
        if (textValue.trim() && !isLoading) {
            isLoading = true;
            try {
                await sendMessage(
                    textValue.trim(),
                    "student",
                    "patient_history",
                    "text",
                );
                textValue = "";

                if (textareaRef) {
                    setTimeout(() => textareaRef?.focus(), 0);
                }
            } catch (error) {
                console.error("Failed to send message:", error);
            } finally {
                isLoading = false;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            handleSend();
        }
    }

    async function handleLabTest(testName: DiagnosticTestName) {
        //get the result from the store which calls the API and then add it to the UI
        const result = await laboratoryStore.orderTest(testName);

        if (result) {
            const message = {
                id: crypto.randomUUID(),
                sender: "assistant",
                content: {
                    testName: result.testName,
                    purpose: result.purpose,
                    status: result.status,
                    results: result.results,
                    interpretation:
                        result.interpretation || "Results are being analyzed.",
                    timestamp: result.timestamp,
                    comments: result.comments,
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
        console.log(result);
    }

    async function handlePhysicalExam(examName: ExaminationName) {
        const result = await examinationStore.performPhysicalExam(examName);

        if (result) {
            const message = {
                id: crypto.randomUUID(),
                sender: "assistant",
                content: {
                    name: result.name,
                    purpose: result.purpose,
                    findings: result.findings,
                    timestamp: result.timestamp,
                },
                timestamp: new Date(),
                type: "examination",
            };
            await sendMessage(
                message.content as ExaminationResult,
                "assistant",
                "examination",
                "examination",
            );
        }
    }

    onMount(() => {
        if (textareaRef) {
            textareaRef.focus();
        }
    });
</script>

<div class="relative flex-1">
    <Textarea
        bind:ref={textareaRef}
        bind:value={textValue}
        class="flex-1 pl-[500px] pt-8 pr-12  focus-visible:ring-black/30"
        placeholder="Type your message... (Ctrl+Enter to send)"
        disabled={isLoading}
        onkeydown={handleKeyDown}
    />
    <div class="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
        <!-- <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <PhysicalExamDropdown onExamination={handlePhysicalExam} />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Perform Physical Examination</p>
                </Tooltip.Content>
            </Tooltip.Root>
            <p class="text-gray-500 pt-2">|</p>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <LabTestsDropdown onOrderTest={handleLabTest} />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Order Lab Tests</p>
                </Tooltip.Content>
            </Tooltip.Root>
            <p class="text-gray-500 pt-2">|</p>
        </Tooltip.Provider> -->
        <TestAutocomplete {caseId} />
    </div>
    <Button
        class="absolute right-2 top-1/2 -translate-y-1/2"
        onclick={handleSend}
        disabled={isLoading}
    >
        {#if isLoading}
            Sending...
        {:else}
            Send
        {/if}
    </Button>
</div>
