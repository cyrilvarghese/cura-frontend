export type TopicItem = {
    number: string;
    competency: string;
    teaching: string;
    assessmentMethod: string[];
};

export type Topic = {
    title: string;
    items: TopicItem[];
};

export interface CurriculumData {
    department: string;
    topics: {
        topic: string;
        competencies: {
            number: string;
            competency: string;
            teaching_methods: string[];
            assessment_methods: string[];
        }[];
    }[];
} 