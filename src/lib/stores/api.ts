import { writable } from 'svelte/store';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
    type?: 'text' | 'image';
    stage?: 'patient_history' | 'examination' | 'diagnosis' | 'treatment';
    imageUrl?: string;
    title?: string;
}

interface ApiState {
    messages: Message[];
    error: string | null;
}

const initialState: ApiState = {
    messages: [
        {
            id: '1',
            sender: 'assistant',
            type: 'image',
            stage: 'patient_history',
            imageUrl: 'https://cdn.midjourney.com/6703f338-5798-4ef4-bc15-865900f67df2/0_3.png',
            title: '" I have rashes all over my hands and it itches a lot "',
            content: 'Patient presenting with rashes and joint pain.',
            timestamp: new Date('2024-02-20T10:00:00')
        },
        {
            id: '2',
            sender: 'patient',
            stage: 'patient_history',
            content: "Doctor, I have rashes and my joints are aching.",
            timestamp: new Date('2024-02-20T10:01:00')
        },
        {
            id: '3',
            sender: 'student',
            stage: 'patient_history',
            content: "I understand. When did the rashes and joint pain start?",
            timestamp: new Date('2024-02-20T10:02:00')
        },
        {
            id: '4',
            sender: 'patient',
            stage: 'patient_history',
            content: "It started about two hours ago. At first, I thought it was just anxiety, but the pain is getting worse.",
            timestamp: new Date('2024-02-20T10:03:00')
        },
        {
            id: '5',
            sender: 'student',
            stage: 'patient_history',
            content: "Thank you for sharing that. Do you feel any pain radiating to other areas, like your arm, jaw, or back?",
            timestamp: new Date('2024-02-20T10:04:00')
        }
    ],
    error: null
};

export const apiStore = writable<ApiState>(initialState);

export async function sendMessage(content: string) {
    apiStore.update(state => {
        const newMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'student',
            stage: 'patient_history',
            content,
            timestamp: new Date()
        };
        
        return {
            ...state,
            messages: [...state.messages, newMessage]
        };
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
} 