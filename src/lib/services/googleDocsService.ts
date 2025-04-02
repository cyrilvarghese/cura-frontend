import { API_BASE_URL } from '$lib/config/api';

export interface GoogleDoc {
    id: string;
    name: string;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
    commentCount: number;
    status: string;
}

export class GoogleDocsService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getAllDocs(): Promise<GoogleDoc[]> {
        try {
            const response = await fetch(`${this.baseUrl}/google-docs`);
            if (!response.ok) {
                throw new Error('Failed to fetch Google docs');
            }
            const data = await response.json();
            return data as GoogleDoc[];
        } catch (error) {
            console.error('Error fetching Google docs:', error);
            throw error;
        }
    }

    async updateDocStatus(docId: string, status: string): Promise<GoogleDoc> {
        try {
            const response = await fetch(`${this.baseUrl}/google-docs/${docId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update doc status');
            }

            return response.json();
        } catch (error) {
            console.error('Error updating doc status:', error);
            throw error;
        }
    }

    async refreshCommentCount(docId: string): Promise<number> {
        try {
            const response = await fetch(`${this.baseUrl}/google-docs/${docId}/comments`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const comments = await response.json();
            return Array.isArray(comments) ? comments.length : 0;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return 0;
        }
    }
} 