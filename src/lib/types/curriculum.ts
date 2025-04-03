export type TopicItem = {
    number: string;
    competency: string;
    teaching: string;
    assessmentMethod: string[];
};



export interface Document {
    id: number;
    title: string;
    type: string;
    url: string;
    description?: string;
    created_at: string;
    google_doc_link: string;
}

export interface CurriculumData {
    department: string;
    topics: {
        topic: string;
        documents: Document[];
        competencies: {
            competency_code: string;
            competency: string;
            teaching_methods: string[];
            assessment_methods: string[];
            assessments: {
                id: number;
                title: string;
                url: string;
            }[];
        }[];
    }[];
} 