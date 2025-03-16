import { writable } from 'svelte/store';
import { documentService, type DocumentUploadResponse } from '../services/documentService';

interface DocumentState {
    isUploading: boolean;
    error: string | null;
    documents: Record<string, DocumentUploadResponse[]>; // Keyed by topic name
    isLoading: boolean;
}

const initialState: DocumentState = {
    isUploading: false,
    error: null,
    documents: {},
    isLoading: false
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

export async function fetchDocumentsByTopic(topicName: string) {
    documentStore.update(state => ({ ...state, isLoading: true, error: null }));

    try {
        const documents = await documentService.getDocumentsByTopic(topicName);

        documentStore.update(state => ({
            ...state,
            isLoading: false,
            documents: {
                ...state.documents,
                [topicName]: documents
            }
        }));

        return documents;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
        documentStore.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
        }));
        throw error;
    }
} 