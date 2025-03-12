import { API_BASE_URL } from '$lib/config/api';

export interface DocumentUploadResponse {
    id: number;
    title: string;
    type: string;
    url: string;
    description?: string;
    created_at: string;
    topic_name: string;
}

export class DocumentService {
    private baseUrl = API_BASE_URL;

    async uploadDocument(
        file: File,
        topicName: string,
        title: string,
        description: string
    ): Promise<DocumentUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topic_name', topicName);
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
            throw new Error('Failed to upload document');
        }

        return await response.json();
    }
}

export const documentService = new DocumentService(); 