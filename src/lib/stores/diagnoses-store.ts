import { writable } from 'svelte/store';

export interface Diagnosis {
    id: string;
    name: string;
    reason: string;
    supportingEvidence: string[];
}

const initialDiagnoses: Diagnosis[] = [
    {
        id: '1',
        name: 'Urticarial Vasculitis',
        reason: 'The rash persists for over 24 hours, resolves with bruising, and is accompanied by joint pain and fatigue—hallmark features of urticarial vasculitis.',
        supportingEvidence: [
            'Rash with post-lesional bruising (specific to vasculitis)',
            'Systemic symptoms like joint pain and fatigue',
            'Absence of new exposures rules out hypersensitivity'
        ]
    },
    // ... add other diagnoses
];

export const diagnoses = writable<Diagnosis[]>(initialDiagnoses); 