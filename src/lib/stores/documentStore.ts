import { writable } from 'svelte/store';
import { documentService, type DocumentUploadResponse } from '../services/documentService';

interface DocumentState {
    isUploading: boolean;
    error: string | null;
    documents: Record<string, DocumentUploadResponse[]>; // Keyed by topic name
}

const initialState: DocumentState = {
    isUploading: false,
    error: null,
    documents: {}
};

export const documentStore = writable<DocumentState>(initialState);

export async function uploadDocument(
    file: File,
    topicName: string,
    title: string,
    description: string
) {
    documentStore.update(state => ({ ...state, isUploading: true, error: null }));

    try {
        debugger;
        const response = await documentService.uploadDocument(file, topicName, title, description);

        documentStore.update(state => {
            const topicDocs = state.documents[topicName] || [];
            return {
                ...state,
                isUploading: false,
                documents: {
                    ...state.documents,
                    [topicName]: [...topicDocs, response]
                }
            };
        });

        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
        documentStore.update(state => ({
            ...state,
            isUploading: false,
            error: errorMessage
        }));
        throw error;
    }
} 