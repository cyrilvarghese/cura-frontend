import { writable } from 'svelte/store';
import { documentService, type DocumentUploadResponse } from '../services/documentService';

interface DocumentState {
    isUploading: boolean;
    error: string | null;
    documents: Record<string, DocumentUploadResponse[]>; // Keyed by department name
    isLoading: boolean;
    selectedCaseDocument: DocumentUploadResponse | null;
}

const initialState: DocumentState = {
    isUploading: false,
    error: null,
    documents: {},
    isLoading: false,
    selectedCaseDocument: null
};

export const documentStore = writable<DocumentState>(initialState);

export async function uploadDocuments(
    files: Array<{ file: File; title: string; description: string }>,
    departmentName: string
) {
    documentStore.update(state => ({ ...state, isUploading: true, error: null }));

    try {
        const responses = await documentService.uploadDocuments(files, departmentName);

        documentStore.update(state => {
            const departmentDocs = state.documents[departmentName] || [];
            return {
                ...state,
                isUploading: false,
                documents: {
                    ...state.documents,
                    [departmentName]: [...departmentDocs, ...responses]
                }
            };
        });

        return responses;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload documents';
        documentStore.update(state => ({
            ...state,
            isUploading: false,
            error: errorMessage
        }));
        throw error;
    }
}

export async function uploadDocument(
    file: File,
    departmentName: string,
    title: string,
    description: string
) {
    documentStore.update(state => ({ ...state, isUploading: true, error: null }));

    try {
        const response = await documentService.uploadDocument(file, departmentName, title, description);

        documentStore.update(state => {
            const departmentDocs = state.documents[departmentName] || [];
            return {
                ...state,
                isUploading: false,
                documents: {
                    ...state.documents,
                    [departmentName]: [...departmentDocs, response]
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

export async function fetchDocumentsByDepartment(departmentName: string) {
    documentStore.update(state => ({ ...state, isLoading: true, error: null }));

    try {
        const documents = await documentService.getDocumentsByDepartment(departmentName);

        documentStore.update(state => ({
            ...state,
            isLoading: false,
            documents: {
                ...state.documents,
                [departmentName]: documents
            }
        }));

        return documents;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch department documents';
        documentStore.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage
        }));
        throw error;
    }
}

export function setSelectedCaseDocument(document: DocumentUploadResponse | null) {
    documentStore.update(state => ({
        ...state,
        selectedCaseDocument: document
    }));
} 