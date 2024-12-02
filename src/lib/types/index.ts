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
    type?: 'text' | 'image' | 'loading' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis' | 'feedback';
    imageUrl?: string;
    title?: string;
}

export interface StudentMessage {
    content: string;
    step: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis';
}

export interface ExaminationResult {
    name: string;
    purpose: string;
    findings: string | FindingContent;
    timestamp: Date;
    status: TestStatus;
    interpretation: string;
}

export interface ExaminationState {
    results: ExaminationResult[];
    isLoading: boolean;
    error: string | null;
}
// Extract exam names from examination-data.json
export type ExaminationName =
    | 'Skin Examination'
    | 'Musculoskeletal Examination'
    | 'Vitals Check'
    | 'Lymph Node Examination'
    | 'Abdominal Examination'
    | 'Neurological Examination'
    | 'Respiratory Examination'
    | 'Ophthalmologic Examination'
    | 'Cardiovascular Examination'
    | 'Oral Examination'
    | 'Hair and Scalp Examination'
    | 'Spinal Examination'
    | 'Peripheral Vascular Examination';

export type DiagnosticTestName =
    | 'Complete Blood Count and ESR'
    | 'ANA Test'
    | 'Complement Levels'
    | 'Skin Biopsy'
    | 'Rheumatoid Factor'
    | 'Anti-dsDNA and Anti-Sm'
    | 'Allergy Panel'
    | 'Chest Imaging';

// export interface ExaminationDataType {
//     purpose: string;
//     findings: {
//         type: 'text' | 'table' | 'image' | 'mixed';
//         content: string | TabularData | ImageData | readonly FindingContent[];
//     };
// }

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

export interface Diagnosis {
    primaryDiagnosis: string;
    justification: string;
    studentMessageHistory: StudentMessage[];
    timestamp?: Date;
    status?: 'initial' | 'final';
    differentialDiagnoses?: string[];
}

export interface FeedbackResponse {
    score: number;
    correctDiagnosis: string;
    feedback: string;
    explanations: string[];
    recommendations: string[];
} 
export interface FeedbackState {
    feedback: string | null;
    score: number | null;
    correctDiagnosis: string | null;
    explanations: string[];
    recommendations: string[];
    isLoading: boolean;
    error: string | null;
}