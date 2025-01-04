<script lang="ts" context="module">
    export interface Step {
        id: number;
        title: string;
        description: string;
        action: () => Promise<void>;
    }
</script>

<script lang="ts">
    import { Check, Loader2 } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";

    export let steps: Step[];
    export let currentStep: number;
    export let completedSteps: Set<number>;
    export let isLoading: boolean;
    export let isDisabled: boolean;

    export let onStepClick: (stepId: number) => void;
</script>

<div class="flex flex-col w-full max-w-md">
    {#each steps as step, index}
        <div class="flex items-start gap-4">
            <!-- Step indicator -->
            <div class="flex flex-col items-center">
                <div
                    class={`
                    rounded-full w-8 h-8 flex items-center justify-center
                    ${
                        completedSteps.has(step.id)
                            ? "bg-green-500"
                            : currentStep === step.id && isLoading
                              ? "bg-blue-500 animate-pulse"
                              : "bg-gray-200"
                    }
                `}
                >
                    {#if completedSteps.has(step.id)}
                        <Check class="h-5 w-5 text-white" />
                    {:else if currentStep === step.id && isLoading}
                        <Loader2 class="h-5 w-5 text-white animate-spin" />
                    {:else}
                        <span class="text-gray-600">{index + 1}</span>
                    {/if}
                </div>
                {#if index !== steps.length - 1}
                    <div class="w-px h-16 bg-gray-200" ></div>
                {/if}
            </div>

            <!-- Step content -->
            <div class="flex-1">
                <Button
                    variant={completedSteps.has(step.id)
                        ? "outline"
                        : "default"}
                    class="w-full justify-start"
                    disabled={isDisabled ||
                        isLoading ||
                        (index > 0 && !completedSteps.has(index - 1))}
                    onclick={() => onStepClick(step.id)}
                >
                    <div class="flex flex-col items-start">
                        <span class="font-medium">{step.title}</span>
                        <span class="text-xs text-muted-foreground"
                            >{step.description}</span
                        >
                    </div>
                </Button>
            </div>
        </div>
    {/each}
</div>
