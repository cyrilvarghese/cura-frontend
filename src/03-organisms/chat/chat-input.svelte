<script lang="ts">
    import Paperclip from "lucide-svelte/icons/paperclip";
    import Mic from "lucide-svelte/icons/mic";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { sendMessage } from "$lib/stores/api";

    let textValue = "";
    let isLoading = false;

    async function handleSend() {
        if (textValue.trim() && !isLoading) {
            isLoading = true;
            try {
                await sendMessage(textValue.trim());
                textValue = ""; // Clear the input after sending
            } catch (error) {
                console.error("Failed to send message:", error);
            } finally {
                isLoading = false;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            handleSend();
        }
    }
</script>

<div class="relative flex-1">
    <Textarea
        bind:value={textValue}
        class="flex-1 pl-24 pt-7 pr-12"
        placeholder="Type your message... (Ctrl+Enter to send)"
        disabled={isLoading}
        onkeydown={handleKeyDown}
    />
    <div class="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 p-0"
            disabled={isLoading}
        >
            <Paperclip class="h-5 w-5" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 p-0"
            disabled={isLoading}
        >
            <Mic class="h-5 w-5" />
        </Button>
    </div>
    <Button
        class="absolute right-2 top-1/2 -translate-y-1/2"
        onclick={handleSend}
        disabled={isLoading}
    >
        {#if isLoading}
            Sending...
        {:else}
            Send
        {/if}
    </Button>
</div>
