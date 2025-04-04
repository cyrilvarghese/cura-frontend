import { API_BASE_URL } from '$lib/config/api';
import { toast } from 'svelte-sonner';

export interface DocumentUploadResponse {
    id: number;
    title: string;
    type: string;
    url: string;
    description?: string;
    google_doc_link: string;
    created_at: string;
    topic_name: string;
}

export class DocumentService {
    private baseUrl = API_BASE_URL;

    async uploadDocument(
        file: File,
        departmentName: string,
        title: string,
        description: string
    ): Promise<DocumentUploadResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('department_name', departmentName);
            formData.append('title', title);
            formData.append('description', description);

            const response = await fetch(
                `${this.baseUrl}/documents/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    toast.error(errorData.detail || 'A document with this title already exists', {
                        style: 'background: white; color: rgb(220 38 38);'
                    });
                    throw new Error(errorData.detail);
                }
                toast.error('Failed to upload document', {
                    style: 'background: white; color: rgb(220 38 38);'
                });
                throw new Error('Failed to upload document');
            }

            const result = await response.json();
            toast.success('Document uploaded successfully', {
                description: `"${title}" has been uploaded`
            });
            return result;
        } catch (error) {
            console.error('Error uploading document:', error);
            // Only show generic toast if it wasn't already handled above
            if (!(error instanceof Error && error.message.includes('already exists'))) {
                toast.error(error instanceof Error ? error.message : 'Please try again later', {
                    style: 'background: white; color: rgb(220 38 38);'
                });
            }
            throw error;
        }
    }

    async getDocumentsByDepartment(departmentName: string): Promise<DocumentUploadResponse[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/curriculum/${departmentName}/documents`
            );

            if (!response.ok) {
                toast.error('Could not load department documents', {
                    style: 'background: white; color: rgb(220 38 38);'
                });
                throw new Error('Failed to fetch documents for department');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error(error instanceof Error ? error.message : 'Please try again later', {
                style: 'background: white; color: rgb(220 38 38);'
            });
            throw error;
        }
    }
}

export const documentService = new DocumentService(); 