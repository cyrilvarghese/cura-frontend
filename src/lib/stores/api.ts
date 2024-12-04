import type { ExaminationResult, FeedbackResponse, FindingContent, Message, PatientFileItem, StudentMessage, TestResult, TestResultContent } from '$lib/types';
import { writable } from 'svelte/store';
import { patientApi } from '$lib/services/patientService';

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
        }
    ],
    error: null
};

export const apiStore = writable<ApiState>(initialState);



// Create a store for student messages only
export const studentMessageHistory = writable<StudentMessage[]>([]);




function isFindingContent(finding: any): finding is FindingContent {
    return finding
        && typeof finding === 'object'
        && 'type' in finding
        && 'content' in finding;
}



// Add this type guard function for TestResult
function isTestResultContent(result: any): result is TestResultContent {
    return result
        && typeof result === 'object'
        && 'type' in result
        && 'content' in result
        && (result.type === 'text' 
            || result.type === 'table' 
            || result.type === 'image' 
            || result.type === 'mixed');
}
 


// Update the store type
export const patientFile = writable<PatientFileItem[]>([]);

// Update the update function
function updatePatientFile(content: TestResult | ExaminationResult, type: 'examination' | 'test-result') {
    if (type === 'examination') {
        const examContent = content as ExaminationResult;
        if (isFindingContent(examContent.findings) && examContent.findings.type === 'mixed') {
            patientFile.update(files => [...files, {
                name: examContent.name,
                result: examContent.findings
            }]);
        }
    } else if (type === 'test-result') {
        const testContent = content as TestResult;
        if (isTestResultContent(testContent.results) && testContent.results.type === 'mixed') {
            patientFile.update(files => [...files, {
                name: testContent.testName,
                result: testContent.results
            }]);
        }
    }
}

export async function sendMessage(content: string | TestResult | ExaminationResult | FeedbackResponse, role: 'student' | 'assistant' | 'patient', step: string, type: 'text' | 'image' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis' | 'feedback' = 'text') {

    // Only store messages from students before the switch
    let messageContent = typeof content === 'object' && content !== null
        ? ('testName' in content
            ? `Test: ${content.testName} `
            : 'name' in content
                ? `Examination: ${content.name} `
                : String(content))
        : String(content);
    // Store all student messages in the history except for feedback
    if (step !== 'feedback') {
        studentMessageHistory.update(messages => [...messages, {
            content: messageContent,
            step,
            timestamp: new Date(),
            type: type
        },
        ]);
    }

    switch (step) {
        case 'patient_history':
            // Add the incoming message to the messages array
            apiStore.update(state => ({
                ...state,
                messages: [...state.messages, {
                    id: crypto.randomUUID(),
                    sender: role,
                    step: step,
                    type: type,
                    content: messageContent,
                    timestamp: new Date()
                }]
            }));
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
            debugger
            // Update store with simulated response for non-patient-history steps
            // types: text, image, test-result, examination, diagnosis, relevant-info, final-diagnosis, feedback
            let resultContent: TestResult | ExaminationResult;

            switch (type) {
                case 'examination':
                case 'test-result':
                    updatePatientFile(content as (TestResult | ExaminationResult), type);
                    break;
                default:
                    console.warn("Unknown type:", type);
                    break;
            }
            apiStore.update(state => ({
                ...state,
                messages: [...state.messages, {
                    id: crypto.randomUUID(),
                    sender: role,
                    step: step,
                    type: type,
                    content: content,
                    timestamp: new Date()
                }]
            }));
            break;
    }
} 