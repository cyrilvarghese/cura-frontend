import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';
import type { ImageSearchQuery } from './imageSearchService';

export interface StreamingImageBatch {
    batch_number: number;
    query_used: string;
    images: Array<{
        url: string;
        description: string;
    }>;
    batch_size: number;
    is_final: boolean;
    case_id: string;
    test_name: string;
    primary_diagnosis: string;
}

export interface StreamingSearchCallbacks {
    onBatch: (batch: StreamingImageBatch) => void;
    onComplete: () => void;
    onError: (error: string) => void;
}

export class StreamingImageSearchService {
    private baseUrl = API_BASE_URL;
    private currentController: AbortController | null = null;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async startStreamingSearch(
        params: ImageSearchQuery,
        callbacks: StreamingSearchCallbacks
    ): Promise<void> {
        console.log('🚀 Starting streaming search with params:', params);

        try {
            // Cancel any existing stream
            this.cancelStream();
            console.log('🗑️ Cancelled any existing streams');

            // Create new abort controller for this stream
            this.currentController = new AbortController();
            console.log('🎮 Created new AbortController');

            const requestBody = {
                case_id: params.case_id,
                test_type: params.test_type,
                test_name: params.test_name,
                max_results: params.max_results || 30,
                search_depth: params.search_depth || 'advanced',
                search_query: params.search_query || ''
            };
            console.log('📤 Request body prepared:', requestBody);

            console.log('📡 Making authenticated request to streaming endpoint...');
            const response = await makeAuthenticatedRequest(
                `${this.baseUrl}/intelligent-image-search/search-stream`,
                {
                    method: 'POST',
                    body: requestBody,
                    signal: this.currentController.signal
                }
            );

            console.log('📨 Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                throw new Error(`Streaming search failed: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            console.log('🌊 Starting to read response stream...');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                let chunkCount = 0;
                let buffer = ''; // Buffer for incomplete JSON objects

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('✅ Stream completed - no more chunks');

                        // Process any remaining data in buffer
                        if (buffer.trim()) {
                            console.log('🔄 Processing final buffer content:', buffer);
                            try {
                                // Handle SSE format: strip "data: " prefix if present
                                let jsonString = buffer.trim();
                                if (jsonString.startsWith('data: ')) {
                                    jsonString = jsonString.substring(6); // Remove "data: " prefix
                                    console.log(`🎯 Stripped SSE prefix from buffer, JSON string:`, jsonString);
                                }

                                const batch: StreamingImageBatch = JSON.parse(jsonString);
                                console.log(`✅ Successfully parsed final batch ${batch.batch_number} from buffer`);
                                callbacks.onBatch(batch);
                            } catch (parseError) {
                                console.warn('❌ Failed to parse final buffer:', {
                                    error: parseError,
                                    buffer: buffer,
                                    bufferPreview: buffer.substring(0, 100) + (buffer.length > 100 ? '...' : '')
                                });
                            }
                        }

                        callbacks.onComplete();
                        break;
                    }

                    chunkCount++;
                    console.log(`📦 Chunk ${chunkCount} received:`, {
                        size: value.length,
                        type: value.constructor.name
                    });

                    // Decode the chunk and add to buffer
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    console.log(`📝 Decoded chunk ${chunkCount}:`, chunk);
                    console.log(`📚 Current buffer length:`, buffer.length);

                    // Split by lines and keep the last incomplete line in buffer
                    const lines = buffer.split('\n');
                    // Keep the last line in buffer (might be incomplete)
                    buffer = lines.pop() || '';

                    // Process complete lines
                    const completeLines = lines.filter(line => line.trim());
                    console.log(`📋 Found ${completeLines.length} complete lines in chunk ${chunkCount}, buffer has ${buffer.length} chars`);

                    for (let i = 0; i < completeLines.length; i++) {
                        const line = completeLines[i];
                        console.log(`🔍 Processing line ${i + 1}/${completeLines.length} from chunk ${chunkCount}:`, line);

                        // Skip empty lines
                        if (!line.trim()) {
                            console.log(`⏭️ Skipping empty line ${i + 1}`);
                            continue;
                        }

                        try {
                            // Handle SSE format: strip "data: " prefix if present
                            let jsonString = line;
                            if (line.startsWith('data: ')) {
                                jsonString = line.substring(6); // Remove "data: " prefix
                                console.log(`🎯 Stripped SSE prefix, JSON string:`, jsonString);
                            }

                            const batch: StreamingImageBatch = JSON.parse(jsonString);
                            console.log(`✅ Successfully parsed batch ${batch.batch_number}:`, {
                                batch_number: batch.batch_number,
                                images_count: batch.images.length,
                                is_final: batch.is_final,
                                query_used: batch.query_used,
                                diagnosis: batch.primary_diagnosis
                            });

                            callbacks.onBatch(batch);

                            // If this is the final batch, we're done
                            if (batch.is_final) {
                                console.log('🏁 Final batch received, completing stream');
                                callbacks.onComplete();
                                return;
                            }
                        } catch (parseError) {
                            console.warn(`❌ Failed to parse line ${i + 1} from chunk ${chunkCount}:`, {
                                error: parseError,
                                line: line,
                                lineLength: line.length,
                                linePreview: line.substring(0, 100) + (line.length > 100 ? '...' : '')
                            });
                            // Continue processing other lines
                        }
                    }
                }
            } finally {
                console.log('🔒 Releasing reader lock');
                reader.releaseLock();
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('🛑 Streaming search was cancelled by user');
                return;
            }

            const errorMessage = error instanceof Error ? error.message : 'Failed to start streaming search';
            console.error('💥 Error in streaming search:', {
                error: error,
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined
            });
            callbacks.onError(errorMessage);
        } finally {
            console.log('🔧 Cleaning up: setting currentController to null');
            this.currentController = null;
        }
    }

    cancelStream(): void {
        if (this.currentController) {
            this.currentController.abort();
            this.currentController = null;
        }
    }

    isStreaming(): boolean {
        return this.currentController !== null;
    }
}

export const streamingImageSearchService = new StreamingImageSearchService(); 