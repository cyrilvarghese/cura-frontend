export type TestStatus = 'completed' | 'pending' | 'failed';

export interface TestResult {
    testName: string;
    purpose: string;
    status: TestStatus;
    results: string;
    interpretation: string;
    timestamp: Date;
}

export interface Message {
    id: string;
    sender: string;
    content: string | TestResult | ExaminationResult;
    step: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'loading' | 'test-result' | 'examination';
    imageUrl?: string;
    title?: string;
}
export interface ExaminationResult {
    name: string;
    purpose: string;
    findings: string;
    timestamp: Date;
    
}

export interface ExaminationState {
    results: ExaminationResult[];
    isLoading: boolean;
    error: string | null;
}
// Status color mappings for UI consistency
export const statusColors = {
    completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    failed: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
} as const;

// Message sender types for type safety
export const MessageSender = {
    STUDENT: 'student',
    ASSISTANT: 'assistant'
} as const;

export type MessageSenderType = typeof MessageSender[keyof typeof MessageSender]; 