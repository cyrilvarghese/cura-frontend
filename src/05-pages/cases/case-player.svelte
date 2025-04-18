<script lang="ts">
    // import CaseSidebar from "../../03-organisms/sidebars/case-sidebar.svelte";
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
    import { currentCaseId } from "$lib/stores/casePlayerStore";
    import { fetchCaseData } from "$lib/stores/casePlayerStore";
    import { onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import LoaderCircle from "lucide-svelte/icons/loader-circle";
    import PageLayout from "../../04-templates/page-layout.svelte";
    import InvestigationDialog from "../../03-organisms/dialogs/pre-treatment-dialog.svelte";
    import TreatmentProtocolDialog from "../../03-organisms/dialogs/treatment-protocol-dialog.svelte";
    import { Pill } from "lucide-svelte";
    import mixpanel from "mixpanel-browser";
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

    // Single state to track current step
    let currentStep = $state("pre-treatment"); // Possible values: 'relevant-info', 'diagnosis', 'final-diagnosis', 'end-case'

    function scrollToLatest() {
        requestAnimationFrame(() => {
            const lastMessage = document.querySelector(
                "#messages-container > div:last-child",
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
        mixpanel.track("start case", {
            "case ID": id,
            "current step": currentStep,
            "start time": new Date().toISOString(),
        });
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
        currentStep = "pre-treatment";
    }

    function handleEndCase() {
        console.log("Case ended");
        mixpanel.track("end case", {
            "case ID": id,
            "current step": currentStep,
            "end time": new Date().toISOString(),
        });
        endCaseDialogOpen = false;
    }

    function handleInvestigationSubmit() {
        console.log("Investigation submitted");
        investigationDialogOpen = false;
        currentStep = "treatment-protocol";
    }

    function handleTreatmentProtocolSubmit() {
        console.log("Treatment protocol submitted");
        treatmentProtocolDialogOpen = false;
        currentStep = "end";
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
        "pre-treatment": {
            label: "Submit Pre-Treatment Investigations",
            icon: Stethoscope,
            action: () => (investigationDialogOpen = true),
            variant: "outline" as const,
        },
        "treatment-protocol": {
            label: "Submit Treatment Protocol",
            icon: Pill,
            action: () => (treatmentProtocolDialogOpen = true),
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

<PageLayout
    breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Case Library", href: "/case-library" },
        { label: `Case ${id}` },
    ]}
>
    <div class="flex gap-4 w-full h-full">
        <div class="w-[70%] h-full flex flex-col">
            <!-- Title Section with Action Buttons -->
            <div
                class="p-4 pl-0 border-b border-gray-300 flex justify-between items-end"
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
                    {@debug currentStep}
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
                <div class="bg-destructive/10 text-destructive p-2 m-2 rounded">
                    {error}
                </div>
            {/if}

            <!-- Chat Messages -->
            <ScrollArea class="p-4 bg-muted/50 h-[calc(100vh-300px)]">
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
                                <Message {message} />
                            </div>
                        {/each}
                    {/if}
                </div>
            </ScrollArea>

            <div class=" pl-0 pt-6 border-t">
                <ChatInput caseId={id} />
                <!-- <TestAutocomplete /> -->
            </div>
        </div>

        <div class="bg-muted/10 rounded-xl w-[30%] h-full">
            <!-- <CaseSidebar /> -->
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

    <InvestigationDialog
        bind:open={investigationDialogOpen}
        onSubmit={handleInvestigationSubmit}
    />

    <TreatmentProtocolDialog
        bind:open={treatmentProtocolDialogOpen}
        onSubmit={handleTreatmentProtocolSubmit}
    />

    <EndCaseDialog bind:open={endCaseDialogOpen} onSubmit={handleEndCase} />
</PageLayout>
