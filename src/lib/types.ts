export interface ExaminationResult {
    name: string;
    purpose: string;
    findings: FindingContent;
    interpretation: string;
    timestamp: Date;
    status: 'pending' | 'completed';
} 