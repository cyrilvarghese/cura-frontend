<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage } from "$lib/stores/apiStore";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import { CheckCircle2, XCircle, AlertCircle } from "lucide-svelte";
    import { preTreatmentStore } from "$lib/stores/preTreatmentStore";
    import type { TestFeedback } from "$lib/services/preTreatmentService";
    import { Input } from "$lib/components/ui/input";
    import TestFeedbackPopover from "../../03-molecules/test-feedback-popover.svelte";
    import { treatmentMonitoringStore } from "$lib/stores/treatmentMonitoringStore";

    let { open = $bindable(false), onSubmit } = $props<{
        open?: boolean;
        onSubmit: () => void;
    }>();

    interface Investigation {
        name: string;
    }

    interface MonitoringPlan {
        timePoint: string;
        test: string;
        fullText: string;
    }

    let investigations = $state<Investigation[]>([]);
    let monitoring = $state<MonitoringPlan[]>([]);

    // New state for form inputs
    let newInvestigation = $state({
        name: "",
    });

    let newMonitoring = $state({
        timePoint: "",
        test: "",
    });

    let isSubmitting = $state(false);
    let feedbackResults = $state<Record<string, TestFeedback>>({});
    let isMonitoringLoading = $state(false);

    // Define the feedback structure to match the API response
    interface FeedbackItem {
        match: boolean;
        specific: string;
        general: string;
        lateral: string;
    }

    async function addInvestigation() {
        if (newInvestigation.name.trim()) {
            try {
                isSubmitting = true;
                const response = await preTreatmentStore.evaluatePreTreatment(
                    newInvestigation.name.split(","),
                );
                feedbackResults = { ...feedbackResults, ...response.feedback };

                console.log(feedbackResults);
                investigations = [
                    ...investigations,
                    { name: newInvestigation.name.trim() },
                ];
            } catch (error) {
                console.error("Error evaluating investigation:", error);
            } finally {
                isSubmitting = false;
                newInvestigation.name = ""; // Clear textbox after API call
            }
        }
    }

    async function addMonitoring() {
        if (newMonitoring.timePoint.trim() && newMonitoring.test.trim()) {
            // Create a single concatenated string in format "test (time)"
            const monitoringText = `${newMonitoring.test.trim()} (${newMonitoring.timePoint.trim()})`;

            try {
                isMonitoringLoading = true;
                const response = await preTreatmentStore.evaluateMonitoring(
                    [monitoringText], // Monitoring input as array
                );

                // Update feedback results with the new feedback
                feedbackResults = { ...feedbackResults, ...response };

                monitoring = [
                    ...monitoring,
                    {
                        timePoint: newMonitoring.timePoint.trim(),
                        test: newMonitoring.test.trim(),
                        fullText: monitoringText,
                    },
                ];
                newMonitoring.timePoint = "";
                newMonitoring.test = "";
            } catch (error) {
                console.error("Error evaluating monitoring:", error);
            } finally {
                isMonitoringLoading = false;
            }
        }
    }

    // Functions to remove items
    function removeInvestigation(index: number) {
        investigations = investigations.filter((_, i) => i !== index);
    }

    function removeMonitoring(index: number) {
        monitoring = monitoring.filter((_, i) => i !== index);
    }

    // Handle key press for adding items
    function handleKeyDown(
        event: KeyboardEvent,
        section: "investigation" | "monitoring",
    ) {
        if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
            event.preventDefault();
            section === "investigation" ? addInvestigation() : addMonitoring();
        }
    }

    function handleMonitoringKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && !isMonitoringLoading) {
            event.preventDefault();
            addMonitoring();
        }
    }

    async function handleSubmit() {
        if (investigations.length === 0 && monitoring.length === 0) return;

        try {
            isSubmitting = true;

            // Extract investigation names
            const preTreatmentInputs = investigations.map((i) => i.name);

            // Extract concatenated monitoring strings
            const monitoringInputs = monitoring.map(
                (m) => `${m.timePoint} - ${m.test}`,
            );

            //call the api
            const response =
                await treatmentMonitoringStore.recordTreatmentMonitoring(
                    preTreatmentInputs,
                    monitoringInputs,
                );

            await sendMessage(
                JSON.stringify(
                    {
                        preTreatmentInvestigations: preTreatmentInputs,
                        postTreatmentMonitoring: monitoringInputs,
                    },
                    null,
                    2,
                ),
                "student",
                "pre-treatment",
                "pre-treatment",
            );

            onSubmit();
            investigations = [];
            monitoring = [];
            open = false;
        } catch (error) {
            console.error("Error submitting pre-treatment information:", error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Pre-treatment Investigation & Monitoring</Dialog.Title
            >
            <Dialog.Description>
                Add investigations needed before treatment and monitoring
                parameters.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-6 py-4">
            <!-- Investigations Section -->
            <div class="space-y-4">
                <h3 class="font-medium text-lg">
                    Pre-treatment Investigations
                </h3>
                <div class="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Add investigation..."
                        bind:value={newInvestigation.name}
                        onkeydown={(e) => handleKeyDown(e, "investigation")}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={addInvestigation}
                        disabled={isSubmitting}
                    >
                        {#if isSubmitting}
                            <Loader2 class="h-4 w-4 animate-spin" />
                        {:else}
                            <Plus class="h-4 w-4" />
                        {/if}
                    </Button>
                </div>

                <div class="flex flex-wrap gap-2">
                    {#each investigations as investigation, index}
                        <TestFeedbackPopover
                            name={investigation.name}
                            feedback={feedbackResults[investigation.name]}
                            onRemove={() => removeInvestigation(index)}
                        />
                    {/each}
                </div>
            </div>

            <!-- Monitoring Section -->
            <div class="space-y-4">
                <h3 class="font-medium text-lg">Monitoring Plan</h3>
                <div class="grid gap-4 py-4">
                    <div class="grid gap-2">
                        <div class="flex items-center gap-2">
                            <Input
                                type="text"
                                id="monitoring-test"
                                placeholder="Test..."
                                bind:value={newMonitoring.test}
                                onkeydown={handleMonitoringKeydown}
                                disabled={isMonitoringLoading}
                            />
                            <Input
                                type="text"
                                id="monitoring-timepoint"
                                placeholder="Time point..."
                                bind:value={newMonitoring.timePoint}
                                onkeydown={handleMonitoringKeydown}
                                disabled={isMonitoringLoading}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onclick={addMonitoring}
                                disabled={isMonitoringLoading}
                            >
                                {#if isMonitoringLoading}
                                    <Loader2 class="h-4 w-4 animate-spin" />
                                {:else}
                                    <Plus class="h-4 w-4" />
                                {/if}
                            </Button>
                        </div>

                        <div class="flex flex-wrap gap-2 mt-2">
                            {#each monitoring as monitor, index}
                                <TestFeedbackPopover
                                    name={monitor.fullText}
                                    timePoint={monitor.timePoint}
                                    test={monitor.test}
                                    feedback={feedbackResults[monitor.fullText]}
                                    onRemove={() => removeMonitoring(index)}
                                />
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog.Footer>
                <Dialog.Close>
                    <Button variant="outline" disabled={isSubmitting}
                        >Cancel</Button
                    >
                </Dialog.Close>
                <Button
                    variant="default"
                    onclick={handleSubmit}
                    disabled={(investigations.length === 0 &&
                        monitoring.length === 0) ||
                        isSubmitting}
                >
                    {#if isSubmitting}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    {:else}
                        Submit Information
                    {/if}
                </Button>
            </Dialog.Footer>
        </div></Dialog.Content
    >
</Dialog.Root>
