import { writable } from 'svelte/store';

export type Department = {
    name: string;
    logo: any; // TODO: Update this type when lucide-svelte updates types
    plan: string;
};

const storedDepartment = localStorage.getItem('currentDepartment');
export const currentDepartment = writable<Department>(storedDepartment ? JSON.parse(storedDepartment) : null);

// Subscribe to changes and update localStorage
currentDepartment.subscribe(value => {
    if (value) {
        localStorage.setItem('currentDepartment', JSON.stringify(value));
    }
});