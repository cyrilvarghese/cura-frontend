import { writable } from 'svelte/store';

export const currentCaseStore = writable<number | null>(null); 