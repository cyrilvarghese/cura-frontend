import type { ExaminationData } from '$lib/types';
import { writable } from 'svelte/store';

export interface TabularData {
    headers: string[];
    rows: (string | number)[][];
}

export interface ImageData {
    url: string;
    caption?: string;
    altText: string;
}


export const examinationData = {
    "Skin Examination": {
        purpose: "Assess rash characteristics",
        findings: {
            type: "mixed" as const,
            content: [
                {
                    type: "text" as const,
                    content: "Red, raised patches on the forearms and legs; some have bruising as they fade. Slight tenderness but no pain."
                },
                {
                    type: "image" as const,
                    content: {
                        url: "https://www.pcds.org.uk/imager/gallery/clinical/urticarial-vasculitis/13305/urt_vascul_33_fee391183f15cb4d62773032fe0be92d.jpg",
                        altText: "Red raised patches on forearm",
                        caption: "Rash distribution on right forearm"
                    }
                }
            ]
        }
    },
    "Musculoskeletal Examination": {
        purpose: "Check for joint-related symptoms",
        findings: {
            type: "text",
            content: "Mild tenderness in the wrists and knees, stiffness especially in the morning, no noticeable swelling or warmth, full range of motion preserved."
        }
    },
    "Vitals Check": {
        purpose: "Evaluate general health",
        findings: {
            type: "table",
            content: {
                headers: ["Measurement", "Value", "Unit", "Reference Range"],
                rows: [
                    ["Temperature", 37.2, "°C", "36.5-37.5"],
                    ["Pulse", 80, "bpm", "60-100"],
                    ["Blood Pressure", "118/76", "mm Hg", "90/60-120/80"],
                    ["BMI", 22.4, "kg/m²", "18.5-24.9"]
                ]
            }
        }
    },
    "Lymph Node Examination": {
        purpose: "Check for lymphadenopathy",
        findings: {
            type: "text",
            content: "No enlarged lymph nodes detected."
        }
    },
    "Abdominal Examination": {
        purpose: "Check for organomegaly or tenderness",
        findings: {
            type: "text",
            content: "Soft and non-tender abdomen, no palpable masses or organ enlargement."
        }
    },
    "Neurological Examination": {
        purpose: "Assess for neurological deficits",
        findings: {
            type: "text",
            content: "Normal reflexes, tone, and power; no sensory deficits."
        }
    },
    "Respiratory Examination": {
        purpose: "Evaluate lung function",
        findings: {
            type: "text",
            content: "Clear lung fields bilaterally, no adventitious sounds."
        }
    },
    "Ophthalmologic Examination": {
        purpose: "Look for ocular involvement",
        findings: {
            type: "text",
            content: "Sclera white, conjunctiva clear, no evidence of uveitis or episcleritis."
        }
    },
    "Cardiovascular Examination": {
        purpose: "Detect cardiovascular abnormalities",
        findings: {
            type: "text",
            content: "Normal heart sounds, no murmurs or rubs."
        }
    },
    "Oral Examination": {
        purpose: "Inspect for oral ulcers or mucosal changes",
        findings: {
            type: "text",
            content: "No abnormalities detected, oral mucosa normal."
        }
    },
    "Hair and Scalp Examination": {
        purpose: "Check for hair thinning or scalp issues",
        findings: {
            type: "text",
            content: "Scalp normal, no hair loss or abnormalities."
        }
    },
    "Spinal Examination": {
        purpose: "Assess spinal tenderness or deformities",
        findings: {
            type: "text",
            content: "No abnormalities, full range of motion."
        }
    },
    "Peripheral Vascular Examination": {
        purpose: "Evaluate pulses and skin changes",
        findings: {
            type: "text",
            content: "Normal peripheral pulses, no edema or cyanosis."
        }
    }
} satisfies Record<string, ExaminationData>;

export type ExaminationName = keyof typeof examinationData;

function createExaminationStore() {
    const { subscribe, update } = writable<{
        currentExam: ExaminationData | null;
        isLoading: boolean;
        error: string | null;
    }>({
        currentExam: null,
        isLoading: false,
        error: null
    });

    async function performExamination(examName: ExaminationName) {
        update(state => ({ ...state, isLoading: true, error: null }));
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const examData = examinationData[examName];
            
            if (!examData) {
                throw new Error(`Examination "${examName}" not found`);
            }

            update(state => ({
                ...state,
                currentExam: examData,
                isLoading: false
            }));

            return examData;

        } catch (error) {
            update(state => ({
                ...state,
                error: error instanceof Error ? error.message : 'Failed to perform examination',
                isLoading: false
            }));
            return null;
        }
    }

    return {
        subscribe,
        performExamination
    };
}

export const examinationStore = createExaminationStore(); 