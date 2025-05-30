import { API_BASE_URL } from '$lib/config/api';
import { toast } from 'svelte-sonner';
import { navigate } from 'svelte-routing';
import { authStore } from '$lib/stores/authStore';
import { currentDepartment } from '$lib/stores/teamStore';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface GoogleDoc {
    id: string;
    name: string;
    webViewLink: string;
    createdTime: string;
    modifiedTime: string;
    commentCount: number;
    status: string;
    approved_by_username?: string;
    url: string;
    department_name: string;
    google_doc_id: string;
}

export interface GoogleDocRequest {
    case_id: string;
    doc_id: string;
}

export class GoogleDocsService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getAllDocs(departmentId: string): Promise<GoogleDoc[]> {
        const toastId = toast.loading('Fetching Google docs...');
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs?department_id=${departmentId}`);
            const data = await response.json();
            toast.dismiss(toastId);
            return data as GoogleDoc[];
        } catch (error) {
            if (error instanceof Response && error.status === 504) {
                toast.error('Google Docs API is down', {
                    id: toastId,
                    description: 'Retrying...'
                });
                setTimeout(async () => {
                    await this.getAllDocs(departmentId);
                }, 1000);
            } else {
                toast.error('Failed to fetch Google docs', {
                    id: toastId,
                    description: 'Please try again later'
                });
            }
            console.error('Error fetching Google docs:', error);
            throw error;
        }
    }

    async updateDocStatus(docId: string, status: string): Promise<GoogleDoc> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs/${docId}/status`, {
                method: 'PUT',
                body: { status }
            });
            return response.json();
        } catch (error) {
            console.error('Error updating doc status:', error);
            throw error;
        }
    }

    async refreshCommentCount(docId: string): Promise<number> {
        const toastId = toast.loading('Refreshing comments...');
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs/${docId}/comments`);
            const comments = await response.json();
            toast.success('Comments refreshed', { id: toastId });
            return Array.isArray(comments) ? comments.length : 0;
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to refresh comments', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Please try again later'
            });
            return 0;
        }
    }

    async deleteDoc(docId: string, docName: string): Promise<void> {
        const toastId = toast.loading('Deleting document...');
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs/${docId}`, {
                method: 'DELETE'
            });
            toast.success('Document deleted', {
                id: toastId,
                description: `${docName} deleted successfully`
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Delete failed', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Please try again later'
            });
            throw error;
        }
    }

    async approveCase(docId: string): Promise<void> {
        const toastId = toast.loading('Approving document...');
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs/${docId}/approve`);
            toast.success('Case approved', {
                id: toastId,
                description: 'Document has been approved successfully'
            });
        } catch (error) {
            if (error instanceof Response && error.status === 401) {
                toast.dismiss();
                toast.error('You are not logged in', {
                    id: toastId,
                    description: 'Redirecting to login page...'
                });
                navigate('/login', { replace: true });
            } else {
                toast.error('Approval failed', {
                    id: toastId,
                    description: error instanceof Error ? error.message : 'Please try again later'
                });
            }
            throw error;
        }
    }

    async uploadDocument(file: File, title: string): Promise<GoogleDoc> {
        const toastId = toast.loading('Uploading document...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);

            const response = await makeAuthenticatedRequest(`${this.baseUrl}/google-docs`, {
                method: 'POST',
                body: formData
            });

            if (response.status === 400) {
                const errorData = await response.json();
                toast.error('Upload failed', {
                    id: toastId,
                    description: errorData.detail || 'A document with this title already exists'
                });
                throw new Error(errorData.detail);
            }

            toast.success('Document uploaded', {
                id: toastId,
                description: `Successfully uploaded "${title}"`
            });

            return response.json();
        } catch (error) {
            console.error('Error uploading document:', error);
            if (!(error instanceof Error && error.message.includes('already exists'))) {
                toast.error('Upload failed', {
                    id: toastId,
                    description: error instanceof Error ? error.message : 'Please try again later'
                });
            }
            throw error;
        }
    }

    async getGoogleDoc(caseId: string) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/google-doc`);
        return response.json();
    }

    async updateGoogleDoc(caseId: string, docData: any) {
        const response = await makeAuthenticatedRequest(`${this.baseUrl}/cases/${caseId}/google-doc`, {
            method: 'PUT',
            body: docData
        });
        return response.json();
    }

    async linkGoogleDoc(request: GoogleDocRequest): Promise<any> {
        try {
            const response = await makeAuthenticatedRequest(`${this.baseUrl}/link-google-doc`, {
                method: 'POST',
                body: request
            });
            return response.json();
        } catch (error) {
            console.error('Error linking Google Doc:', error);
            throw error;
        }
    }
}

export const googleDocsService = new GoogleDocsService(); 