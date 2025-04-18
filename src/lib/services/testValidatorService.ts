import { API_BASE_URL } from '$lib/config/api';
import type { DiagnosticTestName } from '$lib/types/index';
import { toast } from 'svelte-sonner';

export interface TestValidationRequest {
    case_id: string;
    test_type: 'lab_test' | 'physical_exam';
    test_name: DiagnosticTestName;
}

export interface TestValidationResponse {
    case_id: string;
    test_type: string;
    test_name: string;
    timestamp: string;
    result: {
        match: boolean;
        matched_test: string | null;
        reason: string;
        generated_data: TestData;
    };
    test_data: TestData;
    metadata: {
        processing_time_seconds: number;
        model_version: string;
        generation_config: {
            temperature: number;
            top_p: number;
            top_k: number;
        };
    };
}

export interface TestData {
    testName: string;
    purpose: string;
    results: {
        type: string;
        content: {
            headers: string[];
            rows: string[][];
        };
    };
    status: string;
    interpretation: string;
}

export class TestValidatorService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async validateTest(request: TestValidationRequest): Promise<TestValidationResponse> {
        const toastId = toast.loading('Fetching test results...');
        try {
            const response = await fetch(`${this.baseUrl}/test-validator/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`Failed to validate test: ${response.statusText}`);
            }
            toast.dismiss();
            return await response.json();
        } catch (error) {
            console.error('Error validating test:', error);
            throw error;
        }
    }
} 