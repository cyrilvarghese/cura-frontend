<script lang="ts">
    import * as Popover from "$lib/components/ui/popover";
    import { Toggle } from "$lib/components/ui/toggle";
    import { X, CheckCircle2, XCircle } from "lucide-svelte";
    import type { TestFeedback } from "$lib/services/preTreatmentService";
    import { onMount } from "svelte";

    const { name, timePoint, test, onRemove, feedback } = $props<{
        name: string;
        timePoint?: string;
        test?: string;
        onRemove: () => void;
        feedback: TestFeedback;
    }>();

    function getStatusIcon() {
        if (!feedback) return null;
        return feedback.match === true ? CheckCircle2 : XCircle;
    }

    function getStatusColor() {
        if (!feedback) return "";
        return feedback.match === true ? "text-green-500" : "text-red-500";
    }

    let showWhatItIs = $state(false);
    let showWhereUsed = $state(false);
    let open = $state(false);

    onMount(() => {
        showWhatItIs = false;
        showWhereUsed = false;
    });

    function getEncouragingMessage() {
        const messages = [
            "You got it right! ✅",
            "Great choice! ✅",
            "Perfect match! ✅",
            "Excellent thinking! ✅",
            "Spot on! ✅",
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    function getErrorMessage() {
        const messages = [
            "Not quite right ❌",
            "Try again ❌",
            "Not this one ❌",
            "Keep trying ❌",
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger>
        <Toggle variant="outline" size="sm" pressed class="group">
            {#if getStatusIcon()}
                {@const Icon = getStatusIcon()}
                <Icon class="mr-2 h-3 w-3 {getStatusColor()}" />
            {/if}
            <span>
                {#if timePoint && test}
                    {test} ({timePoint})
                {:else}
                    {name}
                {/if}
            </span>
            <button
                class="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                onclick={onRemove}
            >
                <X class="h-3 w-3" />
            </button>
        </Toggle>
    </Popover.Trigger>
    <Popover.Content class="w-80 relative">
        <div class="absolute right-2 top-2">
            <button
                class="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted/50"
                onclick={() => {
                    open = false;
                }}
            >
                <X class="h-4 w-4" />
            </button>
        </div>
        <div class="space-y-4">
            <p class="font-medium text-base">{name}</p>
            <div class="text-sm space-y-3">
                {#if feedback.match === false}
                    <p class="flex flex-col gap-2 items-start">
                        <span class="font-medium text-red-500"
                            >{getErrorMessage()}</span
                        >
                        <span class="flex gap-2">
                            {feedback.specific}
                        </span>
                    </p>
                {:else if feedback.match === "NA"}
                    <p class="flex flex-col gap-2 items-start">
                        <span class="font-medium text-yellow-500"
                            >Not Recognized</span
                        >
                        <span class="flex gap-2">
                            {feedback.specific}
                        </span>
                    </p>
                {:else}
                    <p class="flex flex-col gap-2">
                        <span class="font-medium text-green-500"
                            >{getEncouragingMessage()}</span
                        >
                        <span class="flex gap-2">
                            {feedback.specific}
                        </span>
                    </p>
                {/if}

                {#if feedback.match !== "NA"}
                    <div class="space-y-2 pt-1">
                        <button
                            class="text-blue-500 hover:text-blue-700 flex items-center gap-2 px-2 py-1 rounded border border-blue-200"
                            onclick={() => (showWhatItIs = !showWhatItIs)}
                        >
                            <span class="font-medium">What it is?</span> 🔍
                        </button>
                        {#if showWhatItIs}
                            <p class="pl-2 text-muted-foreground">
                                {feedback.general}
                            </p>
                        {/if}
                    </div>

                    <div class="space-y-2">
                        <button
                            class="text-blue-500 hover:text-blue-700 flex items-center gap-2 px-2 py-1 rounded border border-blue-200"
                            onclick={() => (showWhereUsed = !showWhereUsed)}
                        >
                            <span class="font-medium"
                                >Where else is it used?</span
                            > 🧠
                        </button>
                        {#if showWhereUsed}
                            <p class="pl-2 text-muted-foreground">
                                {feedback.lateral}
                            </p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div></Popover.Content
    >
</Popover.Root>
