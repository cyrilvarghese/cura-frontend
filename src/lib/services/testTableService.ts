import { API_BASE_URL } from '$lib/config/api';

interface UpdateTableRequest {
    case_id: string;
    test_name: string;
    test_type: string;
    rows: Array<{
        values: (string | number)[];
    }>;
}

export class TestTableService {
    private baseUrl = API_BASE_URL;

    async updateTable(params: UpdateTableRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/test-table/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error('Failed to update test table');
        }
    }
}

export const testTableService = new TestTableService(); 