import { writable } from 'svelte/store';
import type { CurriculumData } from '$lib/types/curriculum';
import { CurriculumService } from '$lib/services/curriculumService';

// Create the curriculum data store
export const curriculumStore = writable<CurriculumData | null>(null);

// Create an instance of the curriculum service
const curriculumService = new CurriculumService();

// Function to fetch curriculum data
export const fetchCurriculumData = async () => {
    try {
        const data = await curriculumService.getCurriculumData();
        curriculumStore.set(data);
        debugger
    } catch (error) {
        console.error('Error fetching curriculum data:', error);
        curriculumStore.set(null);
    }
}; 