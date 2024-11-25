<script lang="ts">
    import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
    import ChatInput from "../../03-organisms/chat/chat-input.svelte";
    import Message from "../../03-organisms/chat/message.svelte";
    import { apiStore } from "$lib/stores/api";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import CheckCircle from "lucide-svelte/icons/check-circle";
    import { onMount } from "svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import DiagnosisDialog from "../../03-organisms/dialogs/diagnosis-dialog.svelte";

    const messages = $derived($apiStore.messages);
    const error = $derived($apiStore.error);

    let diagnosisDialogOpen = $state(false);

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

    function handleDiagnosisSubmit() {
        diagnosisDialogOpen = true;
    }

    function handleFinalSubmit() {
        // TODO: Implement final diagnosis submission logic
        console.log("Final diagnosis submitted");
        diagnosisDialogOpen = false;
    }
</script>

<div>
    <div
        class="flex flex-1 flex-col p-4 gap-4 w-[calc(100vw-256px)] h-[calc(100vh-56px)]"
    >
        <div class="flex gap-4 w-full h-full">
            <div class="bg-muted/50 rounded-xl w-[70%] h-full flex flex-col">
                <!-- Title Section with Next Button -->
                <div
                    class="p-4 border-b border-gray-300 flex justify-between items-center"
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
                    <Button
                        variant="outline"
                        class="gap-2"
                        onclick={handleDiagnosisSubmit}
                    >
                        Submit diagnosis
                        <CheckCircle class="h-4 w-4" />
                    </Button>
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

    <DiagnosisDialog 
        bind:open={diagnosisDialogOpen} 
        onSubmit={handleFinalSubmit} 
    />
</div>
