import { writable } from 'svelte/store';

type Team = {
    name: string;
    logo: any; // TODO: Update this type when lucide-svelte updates types
    plan: string;
};

const storedTeam = localStorage.getItem('currentTeam');
export const currentTeam = writable<Team | null>(storedTeam ? JSON.parse(storedTeam) : null);

// Subscribe to changes and update localStorage
currentTeam.subscribe(value => {
    if (value) {
        localStorage.setItem('currentTeam', JSON.stringify(value));
    }
});