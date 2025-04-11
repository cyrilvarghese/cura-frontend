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

interface AddCommentRequest {
    case_id: string;
    test_type: string;
    test_name: string;
    comment: string;
}

interface AddCommentResponse {
    message: string;
    test_name: string;
    comments: string[];
    total_comments: number;
}

interface RemoveCommentRequest {
    case_id: string;
    test_type: string;
    test_name: string;
    comment_index: number;
}

interface RemoveCommentResponse {
    message: string;
    test_name: string;
    comments: string[];
    remaining_comments: number;
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

    async addComment(params: AddCommentRequest): Promise<AddCommentResponse> {
        const response = await fetch(`${this.baseUrl}/test-comment/add`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error('Failed to add comment');
        }

        return response.json();
    }

    async removeComment(params: RemoveCommentRequest): Promise<RemoveCommentResponse> {
        const response = await fetch(`${this.baseUrl}/test-comment/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error('Failed to remove comment');
        }

        return response.json();
    }
}

export const testTableService = new TestTableService(); 