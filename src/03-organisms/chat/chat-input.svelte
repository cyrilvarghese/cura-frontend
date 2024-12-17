<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { sendMessage } from "$lib/stores/apiStore";
    import { ScanEye, TestTubeDiagonal } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { examinationStore } from "$lib/stores/examinationStore";
    import { laboratoryStore } from "$lib/stores/labTestStore";
    import type { ExaminationName, Message } from "$lib/types";
    import type { DiagnosticTestName } from "$lib/types";
    import type { ExaminationResult } from "$lib/types";
    import { apiStore } from "$lib/stores/apiStore";
    import LabTestsDropdown from "../lab-tests/LabTestsDropdown.svelte";
    import PhysicalExamDropdown from '../physical-exam/PhysicalExamDropdown.svelte';

    let textValue = "";
    let isLoading = false;
    let textareaRef: null | HTMLTextAreaElement = null;
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
                },
                timestamp: new Date(),
                type: "test-result",
            };
            await sendMessage(
                message.content,
                "assistant",
                "examination",
                "test-result",
            );
        }
        console.log(result);
    }

    async function handlePhysicalExam(examName: ExaminationName) {
        const result = await examinationStore.performPhysicalExam(examName);
        console.log(result);
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
</script>

<div class="relative flex-1">
    <Textarea
        bind:ref={textareaRef}
        bind:value={textValue}
        class="flex-1 pl-24 pt-7 pr-12"
        placeholder="Type your message... (Ctrl+Enter to send)"
        disabled={isLoading}
        onkeydown={handleKeyDown}
    />
    <div class="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <LabTestsDropdown onOrderTest={handleLabTest} />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Add tests</p>
                </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    <PhysicalExamDropdown 
                        onExamination={handlePhysicalExam}
                    />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Physical examination</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
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
