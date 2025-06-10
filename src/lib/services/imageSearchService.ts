import { API_BASE_URL } from '$lib/config/api';
import { makeAuthenticatedRequest } from '$lib/utils/auth-request';

export interface ImageSearchQuery {
    case_id: string;
    test_type: 'physical_exam' | 'lab_test';
    test_name: string;
    max_results?: number;
    search_depth?: 'basic' | 'advanced';
    search_query?: string;
    single_search?: boolean;
    test_finding?: string;
    serp_key?: string;
}

export interface ImageSearchPreview {
    query: string;
    description?: string;
}

export interface ImageSearchResult {
    case_id: string;
    test_name: string;
    test_type: string;
    primary_diagnosis: string;
    generated_query: string;
    search_context: string;
    images: Array<{
        url: string;
        description: string;
    }>;
    results: Array<{
        title: string;
        url: string;
        content: string;
        score: number;
    }>;
    response_time: number;
    total_images: number;
    total_results: number;
    processing_metadata: {
        total_processing_time: number;
        medical_keywords: string[];
        alternative_contexts: string[];
        original_keyword_query?: string;
        queries_used?: string[];
        parallel_searches?: number;
        domain_restrictions: string;
        gemini_model: string;
        tavily_search_depth: string;
        deduplication_stats?: {
            unique_images: number;
            unique_results: number;
        };
    };
}

export class ImageSearchService {
    private baseUrl = API_BASE_URL;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async previewQuery(params: ImageSearchQuery): Promise<ImageSearchPreview> {
        try {
            const queryParams = new URLSearchParams({
                case_id: params.case_id,
                test_type: params.test_type,
                test_name: params.test_name,
            });

            const response = await makeAuthenticatedRequest(
                `${this.baseUrl}/intelligent-image-search/preview-query?${queryParams}`
            );

            if (!response.ok) {
                throw new Error(`Image search failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in image search preview:', error);
            throw error;
        }
    }

    async executeSearch(params: ImageSearchQuery): Promise<ImageSearchResult> {
        debugger;
        try {
            const requestBody = {
                case_id: params.case_id,
                test_type: params.test_type,
                test_name: params.test_name,
                max_results: params.max_results || 30,
                search_depth: params.search_depth || 'advanced',
                search_query: params.search_query || '',
                single_search: params.single_search || false,
                test_finding: params.test_finding || '',
                serp_key: params.serp_key || ''
            };

            const response = await makeAuthenticatedRequest(
                `${this.baseUrl}/intelligent-image-search/search-serpapi`,
                {
                    method: 'POST',
                    body: requestBody
                }
            );

            if (!response.ok) {
                throw new Error(`Image search failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in image search execution:', error);
            throw error;
        }
    }
}

export const imageSearchService = new ImageSearchService(); 