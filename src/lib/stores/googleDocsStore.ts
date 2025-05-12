import { writable } from 'svelte/store';
import type { GoogleDoc } from '$lib/services/googleDocsService';
import { GoogleDocsService } from '$lib/services/googleDocsService';
import { currentDepartment } from '$lib/stores/teamStore';
const googleDocsService = new GoogleDocsService();

function createGoogleDocsStore() {
    const { subscribe, set, update } = writable<GoogleDoc[]>([]);

    return {
        subscribe,
        loadDocs: async (departmentId: string) => {
            try {
                const docs = await googleDocsService.getAllDocs(departmentId);
                set(docs);
            } catch (error) {
                console.error('Error loading docs:', error);
                set([]);
            }
        },

        async refreshCommentCount(docId: string) {
            try {
                const commentCount = await googleDocsService.refreshCommentCount(docId);
                update(docs => docs.map(doc =>
                    doc.id === docId ? { ...doc, commentCount } : doc
                ));
            } catch (error) {
                console.error('Error refreshing comment count:', error);
            }
        },
        deleteDoc: async (docId: string, docName: string) => {
            try {
                await googleDocsService.deleteDoc(docId, docName);
                update(docs => docs.filter(doc => doc.id !== docId));
                return true;
            } catch (error) {
                console.error('Error deleting doc:', error);
                return false;
            }
        },
        approveCase: async (docId: string) => {
            try {
                await googleDocsService.approveCase(docId);
                return true;
            } catch (error) {
                console.error('Error approving case:', error);
                return false;
            }
        }
    };
}

export const googleDocsStore = createGoogleDocsStore(); 