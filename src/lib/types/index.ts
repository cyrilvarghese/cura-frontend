import type bug from "lucide-svelte/icons/bug";

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
    timestamp: Date | null;
    comments: string[];
    isVerified: boolean;
}
export interface UploadResponse {
    patient_prompt: string;
}


export interface FormattedPersonaResponse {
    id: string | null;
    content: string;
    timestamp: string | null;
    type: 'ai';
    case_id: string | null;

}

export interface Message {
    id: string;
    sender: string;
    content: string | TestResult | ExaminationResult | FeedbackResponse;
    step: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'loading' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis' | 'feedback' | 'treatment-protocol' | 'pre-treatment';
    imageUrl?: string;
    title?: string;
}

export interface StudentMessage {
    content: string;
    step: string;
    timestamp: Date;
    type?: 'text' | 'image' | 'test-result' | 'examination' | 'diagnosis' | 'relevant-info' | 'final-diagnosis' | 'feedback';
}

export interface ExaminationResult {
    name: string;
    purpose: string;
    findings: FindingContent;
    timestamp: Date | null;
    status: TestStatus;
    interpretation: string;
    comments: string[];
    isVerified: boolean;
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
    | 'Peripheral Vascular Examination'
    | any;

export type DiagnosticTestName =
    | 'Complete Blood Count and ESR'
    | 'ANA Test'
    | 'Complement Levels'
    | 'Skin Biopsy'
    | 'Rheumatoid Factor'
    | 'Anti-dsDNA and Anti-Sm'
    | 'Allergy Panel'
    | 'Chest Imaging'
    | any;



export type FindingContent =
    | { readonly type: 'text'; readonly content: string }
    | { readonly type: 'table'; readonly content: TabularData }
    | { readonly type: 'image'; readonly content: ImageData }
    | { readonly type: 'mixed'; readonly content: readonly FindingContent[] };

export interface TabularData {
    headers: string[];
    rows: (string | number)[][];
}
// Define the PatientFileItem interface
export interface PatientFileItem {
    name: string;
    result: FindingContent | TestResultContent;
}


export interface ImageData {
    url: string[];
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

export interface Annotation {
    action: string;
    step: string;
    relevance?: 'relevant' | 'neutral' | 'irrelevant';
    correctness?: 'correct' | 'incorrect';
    justification: string;
}

export interface FeedbackCategory {
    score: number;
    comments: string;
    missed: {
        tips?: string[];
        table_headers?: string[];
        rows?: string[][];
        sections?: {
            title: string;
            medications: {
                class: string;
                drugs: string[];
                note?: string;
            }[];
        }[];
    };
    relevance: string[];
    readMore: string;
}

export interface DetailedFeedback {
    history_taking: FeedbackCategory;
    examinations_performed: FeedbackCategory;
    tests_ordered: FeedbackCategory;
    diagnostic_reasoning: FeedbackCategory;
    synthesis_organization: FeedbackCategory;
}

export interface FeedbackResponse {
    total_score: number;
    feedback: {
        history_taking: FeedbackCategory;
        examinations_performed: FeedbackCategory;
        tests_ordered: FeedbackCategory;
        diagnostic_reasoning: FeedbackCategory;
        synthesis_organization: FeedbackCategory;
        pre_treatment_investigations: FeedbackCategory;
        prescription_writing: FeedbackCategory;
        post_treatment_monitoring: FeedbackCategory;
    };
    suggestions?: string;
    annotations: Annotation[];
}

export interface FeedbackState {
    annotations: Annotation[] | null;
    feedback: DetailedFeedback | null;
    total_score: number | null;
    suggestions: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface ApiResponse {
    response: string;
    thread_id: string;
}

export interface PatientResponse {
    id: string;
    sender: string;
    content: string;
    step: string;
    timestamp: string;
    type: string;
    imageUrl: string;
    title: string;
}

export interface StreamingChunk {
    content: string;
    thread_id?: string;
    // Add other properties as needed
}

export interface CoverImageResponse {
    title: string;
    quote: string;
    prompt: string;
    image_url: string;
    timestamp?: string;
    type?: 'ai';
}