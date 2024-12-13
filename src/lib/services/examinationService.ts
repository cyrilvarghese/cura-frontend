import type { ExaminationName, ExaminationResult, Message } from '$lib/types';
import { API_BASE_URL } from '$lib/config/api';


export class ExaminationService {
    private baseUrl = API_BASE_URL;

    async getExaminationData(examName: ExaminationName): Promise<ExaminationResult> {
        const data = await import('$lib/data/examination-data.json');
        // Transform the data into a Message format
        return data.default[examName] as ExaminationResult;  // Set appropriate content  // Your examination data


        // Future API implementation will return Message directly
        // const response = await fetch(`${this.baseUrl}/examinations`);
        // if (!response.ok) {
        //     throw new Error('Failed to fetch examination data');
        // }
        // return response.json();
    }
}

export const examinationService = new ExaminationService(); 