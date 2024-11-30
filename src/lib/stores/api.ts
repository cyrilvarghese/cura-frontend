import type { ExaminationResult, Message, TestResult } from '$lib/types';
import { writable } from 'svelte/store';
import { patientApi } from '$lib/services/patientApi';
import { examinationService } from '$lib/services/examinationService';

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
            step: 'patient_history',
            imageUrl: 'https://cdn.midjourney.com/6703f338-5798-4ef4-bc15-865900f67df2/0_3.png',
            title: '" I have rashes all over my hands and it itches a lot "',
            content: 'Patient presenting with rashes and joint pain.',
            timestamp: new Date('2024-02-20T10:00:00')
        },
        {
            id: '2',
            sender: 'patient',
            step: 'patient_history',
            content: "Doctor, I have rashes and my joints are aching.",
            timestamp: new Date('2024-02-20T10:01:00')
        },
        {
            id: '3',
            sender: 'student',
            step: 'patient_history',
            content: "I understand. When did the rashes and joint pain start?",
            timestamp: new Date('2024-02-20T10:02:00')
        },
        {
            id: '4',
            sender: 'patient',
            step: 'patient_history',
            content: "It started about two hours ago. At first, I thought it was just anxiety, but the pain is getting worse.",
            timestamp: new Date('2024-02-20T10:03:00')
        },
        {
            id: '5',
            sender: 'student',
            step: 'patient_history',
            content: "Thank you for sharing that. Do you feel any pain radiating to other areas, like your arm, jaw, or back?",
            timestamp: new Date('2024-02-20T10:04:00')
        }
    ],
    error: null
};

export const apiStore = writable<ApiState>(initialState);

export async function sendMessage(content: string | TestResult | ExaminationResult, role: 'student' | 'assistant' | 'patient', step: string, type: 'text' | 'image' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis' = 'text') {


    switch (step) {
        case 'patient_history':
            // Handle real API interactions for patient history questions
            if (role === 'student') {
                try {
                    // Make API call to get patient's response
                    const response = await patientApi.askPatient(content as string);

                    // Update store with patient's response from API
                    apiStore.update(state => ({
                        ...state,
                        messages: [...state.messages, {
                            id: response.id,
                            sender: response.sender.toLowerCase(),
                            step: response.step,
                            type: response.type,
                            content: response.content,
                            timestamp: new Date(response.timestamp)
                        }]
                    }));
                } catch (error) {
                    // Handle any API errors and update error state
                    apiStore.update(state => ({
                        ...state,
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    }));
                }
            }
            break;



        default: // All other steps (examination, diagnosis, treatment)
            // Add artificial delay to simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update store with simulated response for non-patient-history steps
            apiStore.update(state => ({
                ...state,
                messages: [...state.messages, {
                    id: crypto.randomUUID(),
                    sender: 'assistant',
                    step: step,
                    type: type,
                    content: content,
                    timestamp: new Date()
                }]
            }));
            break;
    }
} 