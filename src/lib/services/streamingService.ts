import { writable, type Writable } from 'svelte/store';
import type { ApiResponse, Message, PatientResponse, StreamingChunk } from '$lib/types';
import { threadStore } from '$lib/stores/thread-store';
import { API_BASE_URL } from '$lib/config/api';
import { apiStore } from '$lib/stores/api-store';

interface StreamingOptions {
    onChunk?: (chunk: string) => void;
    onError?: (error: Event) => void;
    onComplete?: () => void;
}

export class StreamingService {
    private baseUrl = API_BASE_URL;
    private eventSource: EventSource | null = null;
    private messageId: string;
    
    constructor() {
        this.messageId = crypto.randomUUID();
    }
    
    async streamPatientResponse(query: string, options: StreamingOptions = {}) {
        let currentThreadId: string | null = null;
        threadStore.subscribe(value => currentThreadId = value)();

        // Add the student's message to the API store
        apiStore.update(state => ({
            ...state,
            messages: [...state.messages, {
                id: crypto.randomUUID(),
                sender: 'student',
                step: 'patient_history',
                type: 'text',
                content: query,
                timestamp: new Date()
            }]
        }));

        // Add initial streaming message
        this.messageId = crypto.randomUUID();
        apiStore.update(state => ({
            ...state,
            messages: [...state.messages, {
                id: this.messageId,
                sender: 'patient',
                step: 'patient_history',
                type: 'text',
                content: '',
                timestamp: new Date()
            }]
        }));

        const url = new URL(`${this.baseUrl}/patient/ask/stream`);
        url.searchParams.append('student_query', query);
        if (currentThreadId) {
            url.searchParams.append('thread_id', currentThreadId);
        }

        this.closeConnection();

        try {
            this.eventSource = new EventSource(url.toString());
            let accumulatedContent = '';

            this.eventSource.onmessage = (event) => {
                if (event.data === '[DONE]') {
                    options.onComplete?.();
                    this.closeConnection();
                    return;
                }

                try {
                    const chunk: StreamingChunk = JSON.parse(event.data);
                    accumulatedContent += chunk.content;
                    
                    // Update the existing message with accumulated content
                    apiStore.update(state => ({
                        ...state,
                        messages: state.messages.map(msg => 
                            msg.id === this.messageId 
                                ? { ...msg, content: accumulatedContent }
                                : msg
                        )
                    }));
                    
                    options.onChunk?.(chunk.content);
                    
                    if (chunk.thread_id) {
                        threadStore.set(chunk.thread_id);
                    }
                } catch (error) {
                    console.error('Error parsing chunk:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('EventSource failed:', error);
                options.onError?.(error);
                this.closeConnection();
            };

        } catch (error) {
            console.error('Failed to establish SSE connection:', error);
            throw error;
        }
    }

    closeConnection() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

export const streamingService = new StreamingService(); 