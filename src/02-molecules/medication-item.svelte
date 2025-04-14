<script lang="ts">
    import { CheckCircle2, Flag, Ban, X } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";

    export let medication: {
        drugName: string;
        dosage: string;
        indication?: string;
        feedback: {
            match: boolean | "NA";
            classification_correct: boolean;
            reason: string;
        };
    };

    export let onRemove: () => void;

    $: bgColor =
        Boolean(medication.feedback.match) && medication.feedback.match !== "NA"
            ? "bg-gray-50"
            : "bg-red-50";
</script>

<div class="flex items-center justify-between {bgColor} p-3 rounded-md">
    <!-- Base medication info -->
    <div class="flex flex-col items-start gap-2 justify-between">
        <div class="flex items-center gap-2">
            <span class="font-medium">{medication.drugName}</span>
            <span class="text-gray-500">({medication.dosage})</span>
            {#if medication.indication}
                <span class="text-gray-600">- {medication.indication}</span>
            {/if}
            {#if medication.feedback.match !== "NA"}
                {#if medication.feedback.classification_correct}
                    <span
                        class="text-green-600 cursor-help"
                        title="Well done! you identified the first line of treatment!"
                    >
                        ⭐
                    </span>
                {:else}
                    <Ban class="h-4 w-4 text-red-600" />
                {/if}
            {/if}
        </div>

        <!-- Feedback section -->
        <div class="flex items-center gap-4">
            {#if Boolean(medication.feedback.match) && medication.feedback.match !== "NA"}
                <div class="flex items-start justify-start flex-row gap-2">
                    <span class="text-green-600">✅</span>
                    <span class="text-sm text-gray-600 w-[600px]"
                        >{medication.feedback.reason}
                        <Button
                            variant="link"
                            class="text-sm p-0 h-0 text-blue-800 hover:underline"
                        >
                            Read more
                        </Button>
                    </span>
                </div>
            {:else}
                <div class="flex items-start justify-start gap-2">
                    <span class="text-sm">❌</span>
                    <span class="text-sm text-gray-600 w-[600px]"
                        >{medication.feedback.reason}
                        <Button
                            variant="link"
                            class="text-sm p-0 h-0 text-blue-800 hover:underline"
                        >
                            Read more
                        </Button>
                    </span>
                </div>
            {/if}
        </div>
    </div>
    <Button
        variant="ghost"
        size="icon"
        onclick={onRemove}
        class="text-gray-500 hover:text-gray-700"
    >
        <X class="h-4 w-4" />
    </Button>
</div>
