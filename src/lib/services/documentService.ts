import { API_BASE_URL } from '$lib/config/api';
import { toast } from 'svelte-sonner';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface DocumentUploadResponse {
    case_id: number;
    content: {
        document_text: string;
    };
    file_path: string;
    timestamp: string;
    type: string;
}

export interface DocumentRequest {
    case_id: string;
    document_text: string;
}

export class DocumentService {
    private baseUrl = API_BASE_URL;

    async uploadFile(file: File, caseId: string): Promise<DocumentUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('case_id', caseId);

            const response = await makeAuthenticatedRequest(`${this.baseUrl}/document/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            toast.success('File uploaded successfully');
            return data;
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
            throw error;
        }
    }

    async getDocument(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/document`);
        return response.json();
    }

    async updateDocument(caseId: string, documentData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/document`, {
            method: 'PUT',
            body: documentData
        });
        return response.json();
    }

    async uploadDocument(request: DocumentRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/upload-document`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }
}

export const documentService = new DocumentService(); 