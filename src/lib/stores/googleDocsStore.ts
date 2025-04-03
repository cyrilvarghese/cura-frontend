import { writable } from 'svelte/store';
import type { GoogleDoc } from '$lib/services/googleDocsService';
import { GoogleDocsService } from '$lib/services/googleDocsService';

const googleDocsService = new GoogleDocsService();

function createGoogleDocsStore() {
    const { subscribe, set, update } = writable<GoogleDoc[]>([]);

    return {
        subscribe,
        loadDocs: async () => {
            try {
                const docs = await googleDocsService.getAllDocs();
                set(docs);
            } catch (error) {
                console.error('Error loading docs:', error);
                set([]);
            }
        },
        updateStatus: async (docId: string, newStatus: string) => {
            try {
                const updatedDoc = await googleDocsService.updateDocStatus(docId, newStatus);
                update(docs => docs.map(doc =>
                    doc.id === docId ? updatedDoc : doc
                ));
            } catch (error) {
                console.error('Error updating doc status:', error);
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
        }
    };
}

export const googleDocsStore = createGoogleDocsStore(); 