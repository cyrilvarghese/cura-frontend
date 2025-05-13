export interface UnmatchedQuestion {
    question: string;
    domain: string;
}

export interface DomainStats {
    total: number;
    remaining: number;
    completed: number;
    percent_complete: number;
}

export interface HistoryMatchMetadata {
    total_expected_questions: number;
    total_student_questions: number;
    total_unmatched_questions: number;
    processing_time_seconds: number;
    model_version: string;
}

export interface HistoryMatchResponse {
    case_id: string;
    student_id: string;
    timestamp: string;
    unmatched_questions: UnmatchedQuestion[];
    domain_stats: Record<string, DomainStats>;
    metadata: HistoryMatchMetadata;
}

export interface ImageData {
    url: string;
    caption?: string;
    altText?: string;
}

export interface PatientFileItem {
    name: string;
    result: {
        type: string;
        content: any;
    };
} 