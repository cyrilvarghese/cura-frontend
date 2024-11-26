export type TestStatus = 'completed' | 'pending' | 'failed';

export type TestResultContent = 
    | { type: 'text'; content: string }
    | { type: 'table'; content: TabularData }
    | { type: 'image'; content: ImageData }
    | { type: 'mixed'; content: TestResultContent[] };

export interface TestResult {
    testName: string;
    purpose: string;
    status: TestStatus;
    results: TestResultContent;
    interpretation: string;
    timestamp: Date;
}

export interface Message {
    id: string;
    sender: string;
    content: string | TestResult | ExaminationResult;
    step: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'loading' | 'test-result' | 'examination' | 'diagnosis';
    imageUrl?: string;
    title?: string;
}
export interface ExaminationResult {
    name: string;
    purpose: string;
    findings: string | FindingContent;
    timestamp: Date;
    status: TestStatus;
}

export interface ExaminationState {
    results: ExaminationResult[];
    isLoading: boolean;
    error: string | null;
}

export interface ExaminationData {
    purpose: string;
    findings: {
        type: 'text' | 'table' | 'image' | 'mixed';
        content: string | TabularData | ImageData | readonly FindingContent[];
    };
}

export type FindingContent = 
    | { readonly type: 'text'; readonly content: string }
    | { readonly type: 'table'; readonly content: TabularData }
    | { readonly type: 'image'; readonly content: ImageData }
    | { readonly type: 'mixed'; readonly content: readonly FindingContent[] };

export interface TabularData {
    headers: string[];
    rows: (string | number)[][];
}

export interface ImageData {
    url: string;
    caption?: string;
    altText: string;
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