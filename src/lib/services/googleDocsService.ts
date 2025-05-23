import { API_BASE_URL } from '$lib/config/api';
import { toast } from 'svelte-sonner';
import { navigate } from 'svelte-routing';
import { authStore } from '$lib/stores/authStore';
import { currentDepartment } from '$lib/stores/teamStore';
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

export class GoogleDocsService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async getAllDocs(departmentId: string): Promise<GoogleDoc[]> {
        const toastId = toast.loading('Fetching Google docs...');
        try {
            const response = await fetch(`${this.baseUrl}/google-docs?department_id=${departmentId}`);
            if (!response.ok) {
                if (response.status === 504) {
                    toast.error('Google Docs API is down', {
                        id: toastId,
                        description: 'Retrying...'
                    });
                    setTimeout(async () => {
                        await this.getAllDocs(departmentId);
                    }, 1000);
                    toast.dismiss();
                }
                else {
                    toast.error('Failed to fetch Google docs', {
                        id: toastId,
                        description: 'Please try again later'
                    });
                    throw new Error('Failed to fetch Google docs');
                }
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
        const toastId = toast.loading('Refreshing comments...');
        try {
            const response = await fetch(`${this.baseUrl}/google-docs/${docId}/comments`);
            if (!response.ok) {
                toast.error('Failed to refresh comments', {
                    id: toastId,
                });
                throw new Error('Failed to fetch comments');
            }
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
            const response = await fetch(`${this.baseUrl}/google-docs/${docId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                toast.error('Delete failed', {
                    id: toastId,
                    description: 'Failed to delete document'
                });
                throw new Error('Failed to delete document');
            }

            toast.success('Document deleted', {
                id: toastId,
                description: `${docName}  deleted successfully`
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
            const response = await fetch(`${this.baseUrl}/google-docs/${docId}/approve`);

            if (!response.ok) {
                if (response.status === 401) {

                    toast.error('You are not logged in', {
                        id: toastId,
                        description: 'Redirecting to login page...'
                    });
                    authStore.logout();
                    toast.dismiss();
                }
                else {
                    toast.error('Approval failed', {
                        id: toastId,
                        description: 'Failed to approve document'
                    });
                    throw new Error('Failed to approve document');
                }
            }
            else {
                toast.success('Case approved', {
                    id: toastId,
                    description: 'Document has been approved successfully'
                });
            }

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

            const response = await fetch(`${this.baseUrl}/google-docs`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    toast.error('Upload failed', {
                        id: toastId,
                        description: errorData.detail || 'A document with this title already exists'
                    });
                    throw new Error(errorData.detail);
                }

                toast.error('Upload failed', {
                    id: toastId,
                    description: 'Failed to upload document'
                });
                throw new Error('Failed to upload document');
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
} 