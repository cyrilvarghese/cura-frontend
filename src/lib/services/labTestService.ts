import type { DiagnosticTestName, Message, TestResult } from '$lib/types';
import { API_BASE_URL } from '$lib/config/api';

export class LabTestService {
    private baseUrl = API_BASE_URL;

    async getLabTestData(testName: DiagnosticTestName): Promise<TestResult> {
        // Load from local JSON
        const data = await import('$lib/data/lab-test-data.json');
        const testData = data.default[testName] as TestResult;
        
        if (!testData) {
            throw new Error(`Lab test data not found for ${testName}`);
        }
        
        return testData;
    }
}

export const labTestService = new LabTestService(); 