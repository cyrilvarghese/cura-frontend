import type { DiagnosticTestName, Message, TestResult } from '$lib/types';

export class LabTestService {
    private baseUrl = 'http://127.0.0.1:8000'; // for future API integration

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