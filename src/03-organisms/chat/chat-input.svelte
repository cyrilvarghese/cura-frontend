<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { sendMessage } from "$lib/stores/api-store";
    import { ScanEye, TestTubeDiagonal } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { examinationStore } from "$lib/stores/examination-store";
    import { laboratoryStore } from "$lib/stores/lab-test-store";
    import type { ExaminationName, Message } from "$lib/types";
    import type { DiagnosticTestName } from "$lib/types";
    import type { ExaminationResult } from "$lib/types";
    import { apiStore } from "$lib/stores/api-store";

    let textValue = "";
    let isLoading = false;
    let textareaRef: null | HTMLTextAreaElement = null;
    async function handleSend() {
        if (textValue.trim() && !isLoading) {
            isLoading = true;
            try {
                const loadingMessage: Message = {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    content: "",
                    timestamp: new Date(),
                    type: "loading",
                    step: "patient_history"
                };
                $apiStore.messages = [...$apiStore.messages, loadingMessage];
                
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
            await sendMessage(message.content, "assistant", "examination", "test-result");
        }
        debugger;
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
            await sendMessage(message.content as ExaminationResult, "assistant", "examination", "examination");
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
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                class="h-8 w-8 p-0"
                                disabled={isLoading}
                            >
                                <TestTubeDiagonal class="h-5 w-5" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content class="w-72">
                            <DropdownMenu.Label
                                >Laboratory Tests</DropdownMenu.Label
                            >
                            <DropdownMenu.Separator />
                            <DropdownMenu.Group>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest(
                                            "Complete Blood Count and ESR",
                                        )}
                                >
                                    Complete Blood Count and ESR
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => handleLabTest("ANA Test")}
                                >
                                    ANA Test
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest("Complement Levels")}
                                >
                                    Complement Levels
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() => handleLabTest("Skin Biopsy")}
                                >
                                    Skin Biopsy
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest("Rheumatoid Factor")}
                                >
                                    Rheumatoid Factor
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest("Anti-dsDNA and Anti-Sm")}
                                >
                                    Anti-dsDNA and Anti-Sm
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest("Allergy Panel")}
                                >
                                    Allergy Panel
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    onclick={() =>
                                        handleLabTest("Chest Imaging")}
                                >
                                    Chest Imaging
                                </DropdownMenu.Item>
                            </DropdownMenu.Group>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Add tests</p>
                </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
                <Tooltip.Trigger>
                    <div>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8 p-0"
                                    disabled={isLoading}
                                >
                                    <ScanEye class="h-5 w-5" />
                                </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content class="w-72">
                                <DropdownMenu.Label
                                    >Physical Examination</DropdownMenu.Label
                                >
                                <DropdownMenu.Separator />
                                <DropdownMenu.Group>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Skin Examination",
                                            )}
                                    >
                                        Skin Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Musculoskeletal Examination",
                                            )}
                                    >
                                        Musculoskeletal Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam("Vitals Check")}
                                    >
                                        Vitals Check
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Lymph Node Examination",
                                            )}
                                    >
                                        Lymph Node Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Abdominal Examination",
                                            )}
                                    >
                                        Abdominal Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Neurological Examination",
                                            )}
                                    >
                                        Neurological Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Respiratory Examination",
                                            )}
                                    >
                                        Ophthalmologic Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Cardiovascular Examination",
                                            )}
                                    >
                                        Cardiovascular Examination</DropdownMenu.Item
                                    >
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Oral Examination",
                                            )}
                                    >
                                        Oral Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Hair and Scalp Examination",
                                            )}
                                    >
                                        Hair and Scalp Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Spinal Examination",
                                            )}
                                    >
                                        Spinal Examination
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        onclick={() =>
                                            handlePhysicalExam(
                                                "Peripheral Vascular Examination",
                                            )}
                                    >
                                        Peripheral Vascular Examination
                                    </DropdownMenu.Item>
                                </DropdownMenu.Group>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
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
