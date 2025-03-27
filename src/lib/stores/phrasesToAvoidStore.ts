import { writable } from 'svelte/store';
import { phrasesToAvoidService } from '$lib/services/phrasesToAvoidService';

export interface PhrasesToAvoidState {
    phrases: string[];
    isLoading: boolean;
    error: string | null;
}

function createPhrasesToAvoidStore() {
    const { subscribe, set, update } = writable<PhrasesToAvoidState>({
        phrases: [],
        isLoading: false,
        error: null
    });

    return {
        subscribe,
        addPhrase: async (caseId: string, phrase: string) => {
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                await phrasesToAvoidService.addPhraseToAvoid(caseId, phrase);
                update(state => ({
                    ...state,
                    isLoading: false,
                    phrases: [...state.phrases, phrase]
                }));
            } catch (error) {
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to add phrase'
                }));
            }
        },
        reset: () => {
            set({ phrases: [], isLoading: false, error: null });
        }
    };
}

export const phrasesToAvoidStore = createPhrasesToAvoidStore(); 