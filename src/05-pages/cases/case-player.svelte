<script lang="ts">
    // import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
    import ChatInput from "../../03-organisms/chat/chat-input.svelte";
    import Message from "../../03-organisms/chat/message.svelte";
    import { apiStore } from "$lib/stores/apiStore";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import InfoIcon from "lucide-svelte/icons/info";
    import Stethoscope from "lucide-svelte/icons/stethoscope";
    import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
    import XCircle from "lucide-svelte/icons/x-circle";
    import DiagnosisDialog from "../../03-organisms/dialogs/diagnosis-dialog.svelte";
    import RelevantInfoDialog from "../../03-organisms/dialogs/relevant-info-dialog.svelte";
    import FinalDiagnosisDialog from "../../03-organisms/dialogs/final-diagnosis-dialog.svelte";
    import EndCaseDialog from "../../03-organisms/dialogs/end-case-dialog.svelte";
    import { studentMessageHistory } from "$lib/stores/apiStore";
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { fetchCaseData } from "$lib/stores/casePlayerStore";
    import { onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import PageLayout from "../../04-templates/page-layout.svelte";
    import InvestigationDialog from "../../03-organisms/dialogs/pre-treatment-dialog.svelte";
    import TreatmentProtocolDialog from "../../03-organisms/dialogs/treatment-protocol-dialog.svelte";
    import { Pill } from "lucide-svelte";
    import { feedbackStore } from "$lib/stores/feedbackStore";
    import OSCEPopup from "../../components/OSCEPopup.svelte";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import TestAutocomplete from "../../03-organisms/chat/test-autocomplete.svelte";
    import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
    import ConversationStarters from "../../components/ConversationStarters.svelte";
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import Maximize2 from "lucide-svelte/icons/maximize-2";
    import Minimize2 from "lucide-svelte/icons/minimize-2";
    import { Button } from "$lib/components/ui/button";
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
    let investigationDialogOpen = $state(false);
    let treatmentProtocolDialogOpen = $state(false);
    let showOSCE = $state(false);

    // Single state to track current step
    let currentStep = $state("final-diagnosis"); // Possible values: 'relevant-info', 'diagnosis', 'final-diagnosis', 'end-case'

    let isEndCaseLoading = $state(false);

    // Add fullscreen state
    let isFullscreen = $state(false);

    // Add state for chat window height

    // Function to calculate chat window height
    function calculateChatWindowHeight() {
        if (isFullscreen) {
            const vh = window.innerHeight;
            console.log("vh", vh);
            const chatWindow = document.getElementById("chat-window");
            if (chatWindow) {
                chatWindow.style.height = `${vh - 200}px`;
            }
        } else {
            const chatWindow = document.getElementById("chat-window");
            if (chatWindow) {
                chatWindow.style.height = "calc(100vh - 240px)";
            }
        }
    }

    // Initial calculation and resize listener
    $effect(() => {
        // // Calculate on initial load
        calculateChatWindowHeight();
        // // Add resize event listener
        window.addEventListener("resize", calculateChatWindowHeight);
        // Clean up listener on component destroy
        return () => {
            window.removeEventListener("resize", calculateChatWindowHeight);
        };
    });

    function scrollToLatest() {
        requestAnimationFrame(() => {
            const lastMessage = document.querySelector(
                "#messages-container #scroll-target",
            );
            if (lastMessage) {
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

                // Collapse the sidebar when a new case is loaded
                try {
                    const sidebar = useSidebar();
                    if (sidebar.state === "expanded") {
                        sidebar.toggle();
                    }
                } catch (error) {
                    console.error("Error collapsing sidebar:", error);
                }

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
        const labTestTrigger = document.getElementById(
            "lab-test-autocomplete-container",
        );
        labTestTrigger?.classList.remove("hidden");
        const testAutocompleteDivider = document.getElementById(
            "test-autocomplete-divider",
        );
        testAutocompleteDivider?.classList.remove("hidden");
    }

    function handleDiagnosisSubmit() {
        console.log("Initial diagnosis submitted");
        diagnosisDialogOpen = false;
        currentStep = "final-diagnosis";
    }

    function handleFinalDiagnosisSubmit() {
        console.log("Final diagnosis submitted");
        finalDiagnosisDialogOpen = false;
        currentStep = "treatment-protocol";
    }

    async function handleEndCase() {
        console.log("Case ended");
        isEndCaseLoading = true;

        try {
            const response = await feedbackStore.generateFinalOsce(id);
            console.log("OSCE generated", response);

            endCaseDialogOpen = false;

            // Call triggerOSCE here to show the OSCE popup
            triggerOSCE();
        } catch (error) {
            console.error("Error generating OSCE:", error);
            // You might want to show an error message to the user here
        } finally {
            isEndCaseLoading = false;
        }
    }

    function handleInvestigationSubmit() {
        console.log("Investigation submitted");
        investigationDialogOpen = false;
        currentStep = "treatment-protocol";
    }

    function handleTreatmentProtocolSubmit() {
        console.log("Treatment protocol submitted");
        treatmentProtocolDialogOpen = false;
        currentStep = "end-case";
    }

    function triggerOSCE() {
        showOSCE = true;
    }

    const stepButtons = {
        "relevant-info": {
            label: "Submit Positive Clinical Findings",
            icon: InfoIcon,
            action: () => (relevantInfoDialogOpen = true),
            className:
                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
            variant: "outline" as const,
            id: "relevant-info",
        },
        diagnosis: {
            label: "Submit Diagnosis",
            icon: Stethoscope,
            action: () => (diagnosisDialogOpen = true),
            variant: "outline" as const,
            className:
                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
            id: "diagnosis",
        },
        "final-diagnosis": {
            label: "Submit Final Diagnosis",
            icon: CheckCircle2,
            action: () => (finalDiagnosisDialogOpen = true),
            variant: "outline" as const,
            className:
                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
            id: "final-diagnosis",
        },
        "pre-treatment": {
            label: "Submit Pre-Treatment Investigations",
            icon: Stethoscope,
            action: () => (investigationDialogOpen = true),
            variant: "outline" as const,
            className:
                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
            id: "pre-treatment",
        },
        "treatment-protocol": {
            label: "Submit Treatment Protocol",
            icon: Pill,
            action: () => (treatmentProtocolDialogOpen = true),
            variant: "outline" as const,
            className:
                "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
            id: "treatment-protocol",
        },
        "end-case": {
            label: "End Case",
            icon: XCircle,
            action: () => (endCaseDialogOpen = true),
            variant: "destructive" as const,
            id: "end-case",
        },
    };

    let osceData = $state<any>(null);
    const unsubscribeOsceData = feedbackStore.subscribe((state) => {
        osceData = state.osceData;
    });

    // Handle general page unload (reload/tab close)
    function handleBeforeUnload(event: BeforeUnloadEvent) {
        // Show a confirmation dialog when navigating away
        event.preventDefault();
        event.returnValue =
            "Are you sure you want to leave? Your progress may not be saved.";
        return event.returnValue;
    }

    // Handle back button specifically
    function handlePopState(event: PopStateEvent) {
        const confirmMessage =
            "Are you sure you want to go back? Your progress may not be saved.";
        if (confirm(confirmMessage)) {
            // User confirmed, allow navigation
            // Remove event listeners to prevent loops
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);

            // Navigate back
            window.history.back();
        } else {
            // User cancelled, prevent navigation by pushing another state
            history.pushState(null, "", window.location.href);
        }
    }

    // Set up the event listeners
    $effect(() => {
        // Add state to the history so we can detect back navigation
        history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);
    });

    // Add this to your onDestroy cleanup
    onDestroy(() => {
        unsubscribe(); // existing unsubscribe
        unsubscribeOsceData(); // new unsubscribe for osceData
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
    });

    function handleNextStep() {
        // Call the appropriate action based on current step
        const currentButton =
            stepButtons[currentStep as keyof typeof stepButtons];
        if (currentButton) {
            currentButton.action();
        }
    }

    // Function to toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(() => {
                    isFullscreen = true;
                })
                .catch((err) => {
                    console.error(
                        `Error attempting to enable fullscreen: ${err.message}`,
                    );
                });
        } else {
            if (document.exitFullscreen) {
                document
                    .exitFullscreen()
                    .then(() => {
                        isFullscreen = false;
                    })
                    .catch((err) => {
                        console.error(
                            `Error attempting to exit fullscreen: ${err.message}`,
                        );
                    });
            }
        }
    }

    // Listen for fullscreen change events from browser
    $effect(() => {
        const handleFullscreenChange = () => {
            isFullscreen = !!document.fullscreenElement;
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    });

    function handleMessageAction(event: CustomEvent) {
        const { type, payload } = event.detail;
        console.log("Opening OSCE dialog");

        switch (type) {
            case "openTreatmentProtocol":
                treatmentProtocolDialogOpen = true;
                break;
            case "openOSCEDialog":
                handleEndCase();
                break;
            // Add more cases as needed
            default:
                console.log("Unhandled message action:", type, payload);
        }
    }
</script>

<PageLayout
    breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Case Library", href: "/case-library" },
        { label: `Case ${id}` },
    ]}
    hideNav={isFullscreen}
>
    <LoadingOverlay isVisible={$isLoading} message="Loading case data..." />
    <LoadingOverlay
        isVisible={isEndCaseLoading}
        message="Generating OSCE Questions..."
    />

    <div class="flex gap-4 w-full h-full">
        <div class="w-[100%] h-full flex flex-col">
            <!-- Title Section with Action Buttons -->
            <div
                class="p-4 pt-2 px-0 border-b border-gray-300 flex justify-between items-end"
            >
                <div class="flex items-star flex-row gap-2">
                    <h2 class="text-2xl font-semibold text-gray-800 pt-2.5">
                        Patient Consultation
                    </h2>
                    <Button
                        variant="ghost"
                        onclick={toggleFullscreen}
                        aria-label={isFullscreen
                            ? "Exit fullscreen"
                            : "Enter fullscreen"}
                        class="text-blue-600 bg-blue-600/10"
                    >
                        {#if isFullscreen}
                            <Minimize2 class="h-5 w-5" /> Minimize
                        {:else}
                            <Maximize2 class="h-5 w-5" /> Maximize
                        {/if}
                    </Button>
                </div>

                <div class="flex gap-2">
                    <TestAutocomplete caseId={id} {currentStep} />

                    <!-- {@debug currentStep}
                    {#if stepButtons[currentStep as keyof typeof stepButtons]}
                        {@const button =
                            stepButtons[
                                currentStep as keyof typeof stepButtons
                            ]}
                        <Button
                            id={button.id}
                            variant={button.variant || "outline"}
                            class={button.className}
                            onclick={button.action}
                        >
                            {button.label}
                            <button.icon class="h-4 w-4" />
                        </Button>
                    {/if} -->
                </div>
            </div>

            {#if error}
                <div class="bg-destructive/10 text-destructive p-2 m-2 rounded">
                    {error}
                </div>
            {/if}

            <!-- Chat Messages -->
            <ScrollArea
                id="chat-window"
                class="p-4 bg-muted/50 relative h-[calc(100vh-240px)]"
            >
                <div id="messages-container" class="messages space-y-4">
                    {#if $isLoading}
                        <div
                            class="flex h-[600px] max w-full items-center justify-center"
                        >
                            <div
                                class="flex flex-col items-center gap-2 text-muted-foreground"
                            >
                                <LoaderCircle
                                    class="h-10 w-10 animate-spin text-muted-foreground/70"
                                />
                                <p class="text-sm">Loading case data...</p>
                            </div>
                        </div>
                    {:else}
                        {#each $apiStore.messages as message}
                            <div class="message-wrapper">
                                <Message
                                    {message}
                                    on:messageAction={handleMessageAction}
                                />
                            </div>
                        {/each}
                    {/if}

                    <!-- component which has tags like converstation starters in a chat -->
                    {#if currentStep !== "treatment-protocol" && currentStep !== "end-case"}
                        <ConversationStarters />
                    {/if}
                    <div class="pl-0 pt-6 h-10" id="scroll-target"></div>
                </div>
            </ScrollArea>

            <div class=" pl-0 pt-2">
                <ChatInput caseId={id} {currentStep} />
            </div>
        </div>

        {#if currentStep !== "treatment-protocol" && currentStep !== "end-case"}
            <div
                class="bg-muted/10 rounded-xl w-[40%] h-full"
                id="case-sidebar-container"
            >
                <CaseSidebar {currentStep} onNextClick={handleNextStep} />
            </div>
        {/if}
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

    <InvestigationDialog
        bind:open={investigationDialogOpen}
        onSubmit={handleInvestigationSubmit}
    />

    <TreatmentProtocolDialog
        bind:open={treatmentProtocolDialogOpen}
        onSubmit={handleTreatmentProtocolSubmit}
    />

    <EndCaseDialog
        bind:open={endCaseDialogOpen}
        onSubmit={handleEndCase}
        isLoading={isEndCaseLoading}
    />

    <!-- Add the OSCE popup component -->
    <OSCEPopup
        isOpen={showOSCE}
        onClose={() => (showOSCE = false)}
        caseData={osceData}
    />
</PageLayout>
