<script lang="ts">
    import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
    import ChatInput from "../../03-organisms/chat/chat-input.svelte";
    import Message from "../../03-organisms/chat/message.svelte";
    import { apiStore } from "$lib/stores/apiStore";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import InfoIcon from "lucide-svelte/icons/info";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
    import XCircle from "lucide-svelte/icons/x-circle";
    import DiagnosisDialog from "../../03-organisms/dialogs/diagnosis-dialog.svelte";
    import RelevantInfoDialog from "../../03-organisms/dialogs/relevant-info-dialog.svelte";
    import FinalDiagnosisDialog from "../../03-organisms/dialogs/final-diagnosis-dialog.svelte";
    import EndCaseDialog from "../../03-organisms/dialogs/end-case-dialog.svelte";
    import { studentMessageHistory } from "$lib/stores/apiStore";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { fetchCaseData } from "$lib/stores/casePlayerStore";
    import { onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    const { id } = $props(); // current case id
    // Add loading state store
    export const isLoading = writable(false);
    // Subscribe to changes if needed
    studentMessageHistory.subscribe((studentMessages) => {
        console.log(studentMessages);
    });
    const messages = $derived($apiStore.messages);
    const error = $derived($apiStore.error);

    let relevantInfoDialogOpen = $state(false);
    let diagnosisDialogOpen = $state(false);
    let finalDiagnosisDialogOpen = $state(false);
    let endCaseDialogOpen = $state(false);

    // Single state to track current step
    let currentStep = $state("relevant-info"); // Possible values: 'relevant-info', 'diagnosis', 'final-diagnosis', 'end-case'

    function scrollToLatest() {
        requestAnimationFrame(() => {
            const lastMessage = document.querySelector(
                "#messages-container > div:last-child",
            );
            if (lastMessage) {
                console.log("Scrolling last message into view");
                lastMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        });
    }
    const unsubscribe = currentCaseId.subscribe(
        async (caseId: string | null) => {
            if (caseId !== null) {
                // Set loading state to true
                isLoading.set(true);

                try {
                    await fetchCaseData(caseId.toString());
                     
                } catch (error) {
                    console.error("Error loading case:", error);
                } finally {
                    // Set loading state to false when done
                    isLoading.set(false);
                }
            }
        },
    );

    // Cleanup function to unsubscribe when the component is destroyed
    onDestroy(() => {
        unsubscribe();
    });
    $effect(() => {
        console.log("Setting current case id to", id);
        currentCaseId.set(id);
    });
    $effect(() => {
        if (messages?.length) {
            scrollToLatest();
        }
    });

    $effect(() => {
        scrollToLatest();
    });

    function handleRelevantInfoSubmit() {
        console.log("Relevant info submitted");
        relevantInfoDialogOpen = false;
        currentStep = "diagnosis";
    }

    function handleDiagnosisSubmit() {
        console.log("Initial diagnosis submitted");
        diagnosisDialogOpen = false;
        currentStep = "final-diagnosis";
    }

    function handleFinalDiagnosisSubmit() {
        console.log("Final diagnosis submitted");
        finalDiagnosisDialogOpen = false;
        currentStep = "end-case";
    }

    function handleEndCase() {
        console.log("Case ended");
        endCaseDialogOpen = false;
    }

    const stepButtons = {
        "relevant-info": {
            label: "Submit Positive Clinical Findings",
            icon: InfoIcon,
            action: () => (relevantInfoDialogOpen = true),
            variant: "outline" as const,
        },
        diagnosis: {
            label: "Submit Diagnosis",
            icon: Stethoscope,
            action: () => (diagnosisDialogOpen = true),
            variant: "outline" as const,
        },
        "final-diagnosis": {
            label: "Submit Final Diagnosis",
            icon: CheckCircle2,
            action: () => (finalDiagnosisDialogOpen = true),
            variant: "outline" as const,
        },
        "end-case": {
            label: "End Case",
            icon: XCircle,
            action: () => (endCaseDialogOpen = true),
            variant: "destructive" as const,
        },
    };
</script>

<div>
    <div
        class="flex flex-1 flex-col p-4 gap-4 w-[calc(100vw-256px)] h-[calc(100vh)]"
    >
        <div class="pl-[64px]">
            <Breadcrumb.Root>
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/">Cases</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/cases"
                            >Diagnosis</Breadcrumb.Link
                        >
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/cases"
                            >Case {id}</Breadcrumb.Link
                        >
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>
        <div class="flex gap-4 w-full h-full h-[calc(100vh-64px)]">
            <div class="bg-muted/50 rounded-xl w-[70%] h-full flex flex-col">
                <!-- Title Section with Action Buttons -->
                <div
                    class="p-4 border-b border-gray-300 flex justify-between items-end"
                >
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-800">
                            Patient Consultation
                        </h2>
                        <p class="text-sm text-gray-500">
                            {#if $apiStore.messages.length > 0}
                                {$apiStore.messages[0].title}
                            {/if}
                        </p>
                    </div>  
                    <div class="flex gap-2">
                        {#if stepButtons[currentStep as keyof typeof stepButtons]}
                            {@const button =
                                stepButtons[
                                    currentStep as keyof typeof stepButtons
                                ]}
                            <Button
                                variant={button.variant || "outline"}
                                class="gap-2"
                                onclick={button.action}
                            >
                                {button.label}
                                <button.icon class="h-4 w-4" />
                            </Button>
                        {/if}
                    </div>
                </div>

                {#if error}
                    <div
                        class="bg-destructive/10 text-destructive p-2 m-2 rounded"
                    >
                        {error}
                    </div>
                {/if}

                <!-- Chat Messages -->
                <ScrollArea class="flex-1 p-4">
                    <div id="messages-container" class="messages space-y-4 max-h-[calc(100vh-300px)]">
                        {#if $isLoading}
                            <div class="flex h-[600px] max w-full items-center justify-center">
                                <div class="flex flex-col items-center gap-2 text-muted-foreground">
                                    <LoaderCircle 
                                        class="h-10 w-10 animate-spin text-muted-foreground/70" 
                                    />
                                    <p class="text-sm">Loading case data...</p>
                                </div>
                            </div>
                        {:else}
                            {#each $apiStore.messages as message}
                                <div class="message-wrapper">
                                    <Message {message} />
                                </div>
                            {/each}
                        {/if}
                    </div>
                </ScrollArea>

                <div class="p-4 border-t">
                    <ChatInput />
                </div>
            </div>

            <div class="bg-muted/10 rounded-xl w-[30%] h-full">
                <CaseSidebar />
            </div>
        </div>
    </div>

    <RelevantInfoDialog
        bind:open={relevantInfoDialogOpen}
        onSubmit={handleRelevantInfoSubmit}
    />

    <DiagnosisDialog
    
        bind:open={diagnosisDialogOpen}
        onSubmit={handleDiagnosisSubmit}
    />

    <FinalDiagnosisDialog
        bind:open={finalDiagnosisDialogOpen}
        onSubmit={handleFinalDiagnosisSubmit}
    />

    <EndCaseDialog bind:open={endCaseDialogOpen} onSubmit={handleEndCase} />
</div>
