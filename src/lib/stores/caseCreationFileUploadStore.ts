import { writable } from 'svelte/store';

//uploaded file store for creating case data
export const uploadedFileStore = writable<File | null>(null);

//case id store for creating case data
export const caseIdStore = writable<string>(''); 