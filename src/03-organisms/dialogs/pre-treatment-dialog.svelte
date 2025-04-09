<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Plus, X } from "lucide-svelte";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import { sendMessage } from "$lib/stores/apiStore";

    export let open = false;
    export let onSubmit: () => void;

    // Store for both sections
    let investigations: string[] = [];
    let monitoring: string[] = [];
    let newInvestigation = "";
    let newMonitoring = "";
    let isSubmitting = false;

    // Functions to add new items
    function addInvestigation() {
        if (newInvestigation.trim()) {
            investigations = [...investigations, newInvestigation.trim()];
            newInvestigation = "";
        }
    }

    function addMonitoring() {
        if (newMonitoring.trim()) {
            monitoring = [...monitoring, newMonitoring.trim()];
            newMonitoring = "";
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

    async function handleSubmit() {
        if (investigations.length === 0 && monitoring.length === 0) return;

        try {
            isSubmitting = true;
            const pretreatmentData = {
                preTreatmentInvestigations: investigations,
                postTreatmentMonitoring: monitoring,
            };

            await sendMessage(
                JSON.stringify(pretreatmentData, null, 2),
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
                    <input
                        type="text"
                        class="flex-1 rounded-md border p-2"
                        placeholder="Add investigation..."
                        bind:value={newInvestigation}
                        on:keydown={(e) => handleKeyDown(e, "investigation")}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={() => addInvestigation()}
                    >
                        <Plus class="h-4 w-4" />
                    </Button>
                </div>

                <div class="space-y-2">
                    {#each investigations as investigation, index}
                        <div class="flex items-center gap-2">
                            <input
                                type="text"
                                class="flex-1 rounded-md border p-2 bg-gray-50"
                                value={investigation}
                                readonly
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => removeInvestigation(index)}
                                class="text-gray-500 hover:text-gray-700"
                            >
                                <X class="h-4 w-4" />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Monitoring Section -->
            <div class="space-y-4">
                <h3 class="font-medium text-lg">Monitoring Plan</h3>
                <div class="flex gap-2">
                    <input
                        type="text"
                        class="flex-1 rounded-md border p-2"
                        placeholder="Add monitoring parameter..."
                        bind:value={newMonitoring}
                        on:keydown={(e) => handleKeyDown(e, "monitoring")}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={() => addMonitoring()}
                    >
                        <Plus class="h-4 w-4" />
                    </Button>
                </div>

                <div class="space-y-2">
                    {#each monitoring as monitor, index}
                        <div class="flex items-center gap-2">
                            <input
                                type="text"
                                class="flex-1 rounded-md border p-2 bg-gray-50"
                                value={monitor}
                                readonly
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => removeMonitoring(index)}
                                class="text-gray-500 hover:text-gray-700"
                            >
                                <X class="h-4 w-4" />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline" disabled={isSubmitting}>Cancel</Button
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
    </Dialog.Content>
</Dialog.Root>
