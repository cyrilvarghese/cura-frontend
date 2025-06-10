import { writable } from 'svelte/store';
import { imageSearchService, type ImageSearchQuery, type ImageSearchResult, type ImageSearchPreview } from '$lib/services/imageSearchService';

export interface ImageSearchState {
    isLoading: boolean;
    preview: ImageSearchPreview | null;
    results: ImageSearchResult | null;
    error: string | null;
    query: ImageSearchQuery | null;
}

const initialState: ImageSearchState = {
    isLoading: false,
    preview: null,
    results: null,
    error: null,
    query: null,
};

export const imageSearchStore = writable<ImageSearchState>(initialState);

// Function to preview search query
export const previewImageSearch = async (query: ImageSearchQuery) => {
    imageSearchStore.update(state => ({
        ...state,
        isLoading: true,
        error: null,
        query,
    }));

    try {
        const preview = await imageSearchService.previewQuery(query);
        imageSearchStore.update(state => ({
            ...state,
            isLoading: false,
            preview,
        }));
        return preview;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search images';
        imageSearchStore.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage,
        }));
        throw error;
    }
};

// Function to execute full search
export const executeImageSearch = async (query: ImageSearchQuery) => {
    imageSearchStore.update(state => ({
        ...state,
        isLoading: true,
        error: null,
        query,
    }));

    try {
        const results = await imageSearchService.executeSearch(query);
        imageSearchStore.update(state => ({
            ...state,
            isLoading: false,
            results,
        }));
        return results;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search images';
        imageSearchStore.update(state => ({
            ...state,
            isLoading: false,
            error: errorMessage,
        }));
        throw error;
    }
};

// Function to clear search results
export const clearImageSearch = () => {
    imageSearchStore.set(initialState);
}; 