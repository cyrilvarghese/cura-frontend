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
    import SendIcon from "lucide-svelte/icons/send";

    let textValue = $state("");
    let isLoading = $state(false);
    const { caseId, currentStep } = $props<{
        caseId: string;
        currentStep: string;
    }>();
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
        if (event.key === "Enter") {
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

<div class="flex flex-row flex-1">
    <div class="flex flex-row relative flex-1 w-full">
        <Textarea
            bind:ref={textareaRef}
            bind:value={textValue}
            class="flex-1 min-h-4 pt-6 focus-visible:ring-black/20 border-radius-none"
            placeholder="Type your message... ( Enter to send)"
            disabled={isLoading}
            onkeydown={handleKeyDown}
        />

        <Button
            class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 w-10 h-10 bg-muted hover:bg-muted/80 flex items-center justify-center"
            onclick={handleSend}
            disabled={isLoading || !textValue.trim()}
        >
            {#if isLoading}
                <div
                    class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                ></div>
            {:else}
                <SendIcon
                    class="h-5 w-5 {textValue.trim()
                        ? 'text-primary'
                        : 'text-muted-foreground'}"
                />
            {/if}
        </Button>
    </div>
</div>
