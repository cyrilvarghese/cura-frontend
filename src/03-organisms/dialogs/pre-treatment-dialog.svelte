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
    import { Toggle } from "$lib/components/ui/toggle";
    import { Input } from "$lib/components/ui/input";
    import * as Popover from "$lib/components/ui/popover";

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

    async function addInvestigation() {
        if (newInvestigation.name.trim()) {
            try {
                isSubmitting = true;
                const response = await preTreatmentStore.evaluatePreTreatment(
                    newInvestigation.name.split(","),
                );
                feedbackResults = { ...feedbackResults, ...response.feedback };
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

    function getStatusIcon(testName: string) {
        const feedback = feedbackResults[testName];
        if (!feedback) return null;

        switch (feedback.match) {
            case true:
                return CheckCircle2;
            case false:
                return XCircle;
            case "NA":
                return AlertCircle;
            default:
                return null;
        }
    }

    function getStatusColor(testName: string) {
        const feedback = feedbackResults[testName];
        if (!feedback) return "";

        switch (feedback.match) {
            case true:
                return "text-green-500";
            case false:
                return "text-destructive";
            case "NA":
                return "text-yellow-500";
            default:
                return "";
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
                        <Popover.Root>
                            <Popover.Trigger>
                                <Toggle
                                    variant="outline"
                                    size="sm"
                                    pressed
                                    class="group"
                                >
                                    {#if getStatusIcon(investigation.name)}
                                        {@const Icon = getStatusIcon(
                                            investigation.name,
                                        )}
                                        <Icon
                                            class="mr-2 h-3 w-3 {getStatusColor(
                                                investigation.name,
                                            )}"
                                        />
                                    {/if}
                                    <span>{investigation.name}</span>
                                    <button
                                        class="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                                        onclick={() =>
                                            removeInvestigation(index)}
                                    >
                                        <X class="h-3 w-3" />
                                    </button>
                                </Toggle>
                            </Popover.Trigger>
                            {#if feedbackResults[investigation.name]}
                                <Popover.Content class="w-80">
                                    <div class="space-y-2">
                                        <p class="font-medium">
                                            {investigation.name}
                                        </p>
                                        {#if feedbackResults[investigation.name].match === "NA"}
                                            <p class="text-destructive">
                                                Details not found
                                            </p>
                                        {:else}
                                            <div class="text-sm space-y-1">
                                                <p>
                                                    <span class="font-medium"
                                                        >Specific:</span
                                                    >
                                                    {feedbackResults[
                                                        investigation.name
                                                    ].specific}
                                                </p>
                                                <p>
                                                    <span class="font-medium"
                                                        >General:</span
                                                    >
                                                    {feedbackResults[
                                                        investigation.name
                                                    ].general}
                                                </p>
                                                <p>
                                                    <span class="font-medium"
                                                        >Lateral:</span
                                                    >
                                                    {feedbackResults[
                                                        investigation.name
                                                    ].lateral}
                                                </p>
                                            </div>
                                        {/if}
                                    </div>
                                </Popover.Content>
                            {/if}
                        </Popover.Root>
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
                                id="monitoring-timepoint"
                                placeholder="Time point..."
                                bind:value={newMonitoring.timePoint}
                                onkeydown={handleMonitoringKeydown}
                                disabled={isMonitoringLoading}
                            />
                            <Input
                                type="text"
                                id="monitoring-test"
                                placeholder="Test..."
                                bind:value={newMonitoring.test}
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
                                <Popover.Root>
                                    <Popover.Trigger>
                                        <Toggle
                                            variant="outline"
                                            size="sm"
                                            pressed
                                            class="group"
                                        >
                                            {#if getStatusIcon(monitor.fullText)}
                                                {@const Icon = getStatusIcon(
                                                    monitor.fullText,
                                                )}
                                                <Icon
                                                    class="mr-2 h-3 w-3 {getStatusColor(
                                                        monitor.fullText,
                                                    )}"
                                                />
                                            {/if}
                                            <span
                                                >{monitor.test} ({monitor.timePoint})</span
                                            >
                                            <button
                                                class="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                                                onclick={() =>
                                                    removeMonitoring(index)}
                                            >
                                                <X class="h-3 w-3" />
                                            </button>
                                        </Toggle>
                                    </Popover.Trigger>
                                    <Popover.Content class="w-80">
                                        <div class="space-y-2">
                                            <p class="font-medium">
                                                {monitor.fullText}
                                            </p>
                                            {#if feedbackResults[monitor.fullText]?.match === "NA"}
                                                <p class="text-destructive">
                                                    Details not found
                                                </p>
                                            {:else if feedbackResults[monitor.fullText]}
                                                <div class="text-sm space-y-1">
                                                    <p>
                                                        <span
                                                            class="font-medium"
                                                            >Specific:</span
                                                        >
                                                        {feedbackResults[
                                                            monitor.fullText
                                                        ].specific}
                                                    </p>
                                                    <p>
                                                        <span
                                                            class="font-medium"
                                                            >General:</span
                                                        >
                                                        {feedbackResults[
                                                            monitor.fullText
                                                        ].general}
                                                    </p>
                                                    <p>
                                                        <span
                                                            class="font-medium"
                                                            >Lateral:</span
                                                        >
                                                        {feedbackResults[
                                                            monitor.fullText
                                                        ].lateral}
                                                    </p>
                                                </div>
                                            {/if}
                                        </div>
                                    </Popover.Content>
                                </Popover.Root>
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
