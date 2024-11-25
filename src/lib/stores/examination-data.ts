import { writable } from 'svelte/store';

export interface ExaminationData {
    purpose: string;
    findings: string;
}

export const examinationData = {
    "Skin Examination": {
        purpose: "Assess rash characteristics",
        findings: "Red, raised patches on the forearms and legs; some have bruising as they fade. Slight tenderness but no pain."
    },
    "Musculoskeletal Examination": {
        purpose: "Check for joint-related symptoms",
        findings: "Mild tenderness in the wrists and knees, stiffness especially in the morning, no noticeable swelling or warmth, full range of motion preserved."
    },
    "Vitals Check": {
        purpose: "Evaluate general health",
        findings: "Temperature: 37.2°C (98.9°F), Pulse: 80/min, Blood Pressure: 118/76 mm Hg, Normal height, weight, and BMI."
    },
    "Lymph Node Examination": {
        purpose: "Check for lymphadenopathy",
        findings: "No enlarged lymph nodes detected."
    },
    "Abdominal Examination": {
        purpose: "Check for organomegaly or tenderness",
        findings: "Soft and non-tender abdomen, no palpable masses or organ enlargement."
    },
    "Neurological Examination": {
        purpose: "Assess for neurological deficits",
        findings: "Normal reflexes, tone, and power; no sensory deficits."
    },
    "Respiratory Examination": {
        purpose: "Evaluate lung function",
        findings: "Clear lung fields bilaterally, no adventitious sounds."
    },
    "Ophthalmologic Examination": {
        purpose: "Look for ocular involvement",
        findings: "Sclera white, conjunctiva clear, no evidence of uveitis or episcleritis."
    },
    "Cardiovascular Examination": {
        purpose: "Detect cardiovascular abnormalities",
        findings: "Normal heart sounds, no murmurs or rubs."
    },
    "Oral Examination": {
        purpose: "Inspect for oral ulcers or mucosal changes",
        findings: "No abnormalities detected, oral mucosa normal."
    },
    "Hair and Scalp Examination": {
        purpose: "Check for hair thinning or scalp issues",
        findings: "Scalp normal, no hair loss or abnormalities."
    },
    "Spinal Examination": {
        purpose: "Assess spinal tenderness or deformities",
        findings: "No abnormalities, full range of motion."
    },
    "Peripheral Vascular Examination": {
        purpose: "Evaluate pulses and skin changes",
        findings: "Normal peripheral pulses, no edema or cyanosis."
    }
} as const;

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