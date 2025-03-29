import { API_BASE_URL } from '$lib/config/api';

interface UpdateTableRequest {
    case_id: string;
    test_name: string;
    test_type: string;
    rows: Array<{
        values: (string | number)[];
    }>;
}

interface DeleteRowRequest {
    case_id: string;
    test_name: string;
    test_type: string;
    row_identifier: string;
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

    async deleteRow(params: DeleteRowRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/test-table/remove-row`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error('Failed to delete row from test table');
        }
    }
}

export const testTableService = new TestTableService(); 