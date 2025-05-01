import { writable } from 'svelte/store';

// Create a writable store with an empty array as the initial value
const findings = writable<string[]>([]);

// Create and export the store with methods to interact with it
export const relevantFindingsStore = {
    // Get the current findings
    getFindings: () => {
        let currentFindings: string[] = [];
        findings.subscribe(value => {
            currentFindings = value;
        })();
        return currentFindings;
    },

    // Set new findings
    setFindings: (newFindings: string[]) => {
        findings.set(newFindings);
    },

    // Add a single finding
    addFinding: (finding: string) => {
        findings.update(currentFindings => [...currentFindings, finding]);
    },

    // Remove a finding
    removeFinding: (index: number) => {
        findings.update(currentFindings =>
            currentFindings.filter((_, i) => i !== index)
        );
    },

    // Clear all findings
    clearFindings: () => {
        findings.set([]);
    },

    // Subscribe to changes
    subscribe: findings.subscribe
}; 