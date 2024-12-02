import { writable } from 'svelte/store';

export const threadStore = writable<string | null>(null); 