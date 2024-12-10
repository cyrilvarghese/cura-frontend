<script lang="ts">
    import { streamingService } from '$lib/services/streamingService';
    import { apiStore } from '$lib/stores/api-store';
    import { onDestroy } from 'svelte';
    import type { Message } from '$lib/types';

    let message = '';
    let isStreaming = false;
    
    $: messages = $apiStore.messages;

    async function handleSubmit() {
        if (!message.trim() || isStreaming) return;
        
        isStreaming = true;
        
        try {
            await streamingService.streamPatientResponse(message, {
                onChunk: (chunk) => {
                    // Chunks are now handled automatically via the apiStore
                },
                onComplete: () => {
                    message = '';
                    isStreaming = false;
                },
                onError: (error) => {
                    console.error('Streaming error:', error);
                    isStreaming = false;
                }
            });
        } catch (error) {
            console.error('Failed to start streaming:', error);
            isStreaming = false;
        }
    }

    // Cleanup on component destruction
    onDestroy(() => {
        streamingService.closeConnection();
    });
</script>

<div class="chat-container">
    <div class="messages-container">
        {#each messages as message}
            <div class="message {message.sender}">
                <p>{message.content}</p>
                <span class="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </span>
            </div>
        {/each}
    </div>

    <form on:submit|preventDefault={handleSubmit} class="input-form">
        <input 
            type="text" 
            bind:value={message} 
            placeholder="Ask the patient..."
            disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming}>
            {isStreaming ? 'Streaming...' : 'Send'}
        </button>
    </form>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 800px;
        margin: 0 auto;
    }

    .messages-container {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .message {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        max-width: 80%;
    }

    .message.student {
        align-self: flex-end;
        background-color: #e3f2fd;
    }

    .message.patient {
        align-self: flex-start;
        background-color: #f5f5f5;
    }

    .timestamp {
        font-size: 0.75rem;
        color: #666;
        display: block;
        margin-top: 0.25rem;
    }

    .input-form {
        display: flex;
        gap: 0.5rem;
        padding: 1rem;
        border-top: 1px solid #eee;
    }

    input {
        flex-grow: 1;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 0.25rem;
    }

    button {
        padding: 0.5rem 1rem;
        background-color: #2196f3;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    button:disabled {
        background-color: #ccc;
    }
</style> 