<script lang="ts">
    import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
    import ChatInput from "../../03-organisms/chat/chat-input.svelte";
    import Message from "../../03-organisms/chat/message.svelte";
    import { apiStore } from "$lib/stores/api";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import InfoIcon from "lucide-svelte/icons/info";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
    import XCircle from "lucide-svelte/icons/x-circle";
    import { onMount } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import DiagnosisDialog from "../../03-organisms/dialogs/diagnosis-dialog.svelte";
    import RelevantInfoDialog from "../../03-organisms/dialogs/relevant-info-dialog.svelte";
    import FinalDiagnosisDialog from "../../03-organisms/dialogs/final-diagnosis-dialog.svelte";
    import EndCaseDialog from "../../03-organisms/dialogs/end-case-dialog.svelte";

    const messages = $derived($apiStore.messages);
    const error = $derived($apiStore.error);

    let relevantInfoDialogOpen = $state(false);
    let diagnosisDialogOpen = $state(false);
    let finalDiagnosisDialogOpen = $state(false);
    let endCaseDialogOpen = $state(false);

    // Single state to track current step
    let currentStep = $state('relevant-info'); // Possible values: 'relevant-info', 'diagnosis', 'final-diagnosis', 'end-case'

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
        currentStep = 'diagnosis';
    }

    function handleDiagnosisSubmit() {
        console.log("Initial diagnosis submitted");
        diagnosisDialogOpen = false;
        currentStep = 'final-diagnosis';
    }

    function handleFinalDiagnosisSubmit() {
        console.log("Final diagnosis submitted");
        finalDiagnosisDialogOpen = false;
        currentStep = 'end-case';
    }

    function handleEndCase() {
        console.log("Case ended");
        endCaseDialogOpen = false;
    }
</script>

<div>
    <div
        class="flex flex-1 flex-col p-4 gap-4 w-[calc(100vw-256px)] h-[calc(100vh-56px)]"
    >
        <div class="flex gap-4 w-full h-full">
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
                            Case #123 - Persistent Rash with Joint Pain and
                            Fatigue
                        </p>
                    </div>
                    <div class="flex gap-2">
                        {#if currentStep === 'relevant-info'}
                            <Button
                                variant="outline"
                                class="gap-2"
                                onclick={() => (relevantInfoDialogOpen = true)}
                            >
                                Submit Relevant Info
                                <InfoIcon class="h-4 w-4" />
                            </Button>
                        {:else if currentStep === 'diagnosis'}
                            <Button
                                variant="outline"
                                class="gap-2"
                                onclick={() => (diagnosisDialogOpen = true)}
                            >
                                Submit Diagnosis
                                <Stethoscope class="h-4 w-4" />
                            </Button>
                        {:else if currentStep === 'final-diagnosis'}
                            <Button
                                variant="outline"
                                class="gap-2"
                                onclick={() => (finalDiagnosisDialogOpen = true)}
                            >
                                Submit Final Diagnosis
                                <CheckCircle2 class="h-4 w-4" />
                            </Button>
                        {:else if currentStep === 'end-case'}
                            <Button
                                variant="destructive"
                                class="gap-2"
                                onclick={() => (endCaseDialogOpen = true)}
                            >
                                End Case
                                <XCircle class="h-4 w-4" />
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
                    <div id="messages-container" class="messages space-y-4">
                        {#each messages as message}
                            <div class="message-wrapper">
                                <Message {message} />
                            </div>
                        {/each}
                    </div>
                </ScrollArea>

                <div class="p-4 border-t">
                    <ChatInput />
                </div>
            </div>

            <div class="bg-muted/50 rounded-xl w-[30%] h-full">
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
