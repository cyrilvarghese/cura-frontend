<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { AlertCircle } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge";
    export let missedLabs: { testName: string; relevance?: string }[] = [];
</script>

<Dialog.Root>
    <Dialog.Trigger asChild>
        <button
            class="py-2 px-4 bg-amber-50 text-amber-800 font-medium rounded-md border border-amber-200 flex items-center gap-2"
        >
            <AlertCircle class="w-5 h-5" />
            Missed Lab Tests ({missedLabs.length})
        </button>
    </Dialog.Trigger>
    <Dialog.Content class="max-w-3xl">
        <Dialog.Header>
            <Dialog.Title>Missed Lab Tests</Dialog.Title>
        </Dialog.Header>
        <div class="mt-4 max-h-[80vh] overflow-y-auto">
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each missedLabs as item}
                    <li class="border-l-4 border-amber-400 pl-4 py-2">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-semibold text-base"
                                >{item.testName}</span
                            >
                        </div>
                        {#if item.relevance}
                            <p class="text-gray-700 text-sm mb-2">
                                <span class="font-medium text-amber-700"
                                    >Relevance:</span
                                >
                                {item.relevance}
                            </p>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
    </Dialog.Content>
</Dialog.Root>
