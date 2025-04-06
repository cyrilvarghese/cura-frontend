<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";

    export let drugName: string;
    export let isOpen: boolean;

    type DrugDetail = {
        class: string;
        mechanism: string;
        indications: string[];
        contraindications: string[];
        sideEffects: string[];
        monitoring: string[];
    };

    type DrugDetails = {
        [key: string]: DrugDetail;
    };

    const drugDetails: DrugDetails = {
        Cetirizine: {
            class: "Second-generation antihistamine",
            mechanism: "H1 receptor antagonist",
            indications: ["Allergic rhinitis", "Urticaria", "Pruritus"],
            contraindications: [
                "Severe renal impairment",
                "Pregnancy category B",
            ],
            sideEffects: ["Drowsiness", "Dry mouth", "Headache"],
            monitoring: [
                "No routine monitoring required",
                "Adjust dose in renal impairment",
            ],
        },
        Hydroxyzine: {
            class: "First-generation antihistamine",
            mechanism: "H1 receptor antagonist with sedative properties",
            indications: [
                "Anxiety",
                "Pruritus",
                "Allergic reactions",
                "Sedation",
            ],
            contraindications: [
                "Early pregnancy",
                "Elderly patients",
                "QT interval prolongation",
            ],
            sideEffects: [
                "Sedation",
                "Anticholinergic effects",
                "Dry mouth",
                "Blurred vision",
            ],
            monitoring: [
                "ECG monitoring in high-risk patients",
                "Mental status in elderly",
            ],
        },
        "Loratadine/Fexofenadine": {
            class: "Second-generation antihistamine",
            mechanism: "Selective peripheral H1 receptor antagonist",
            indications: [
                "Seasonal allergies",
                "Chronic urticaria",
                "Allergic rhinitis",
            ],
            contraindications: [
                "Severe liver disease",
                "Renal impairment (dose adjustment needed)",
            ],
            sideEffects: [
                "Headache",
                "Fatigue",
                "Dry mouth",
                "Minimal sedation",
            ],
            monitoring: ["Liver function in long-term use"],
        },
        Ibuprofen: {
            class: "NSAID (Non-steroidal anti-inflammatory drug)",
            mechanism: "COX-1 and COX-2 inhibitor",
            indications: ["Pain", "Inflammation", "Fever"],
            contraindications: [
                "Peptic ulcer disease",
                "Severe heart failure",
                "Third trimester pregnancy",
                "Bleeding disorders",
            ],
            sideEffects: [
                "GI upset/bleeding",
                "Increased bleeding risk",
                "Renal impairment",
                "Cardiovascular risks",
            ],
            monitoring: [
                "Renal function",
                "Blood pressure",
                "GI symptoms",
                "CBC in long-term use",
            ],
        },
        Naproxen: {
            class: "NSAID (Non-steroidal anti-inflammatory drug)",
            mechanism: "COX-1 and COX-2 inhibitor",
            indications: ["Pain", "Inflammation", "Fever", "Menstrual cramps"],
            contraindications: [
                "Active GI bleeding",
                "Severe heart failure",
                "Third trimester pregnancy",
            ],
            sideEffects: [
                "GI upset/bleeding",
                "Increased bleeding risk",
                "Hypertension",
                "Edema",
            ],
            monitoring: [
                "Renal function",
                "Blood pressure",
                "GI symptoms",
                "CBC in long-term use",
            ],
        },
        Prednisolone: {
            class: "Corticosteroid",
            mechanism: "Anti-inflammatory and immunosuppressive effects",
            indications: [
                "Severe allergic reactions",
                "Autoimmune conditions",
                "Inflammatory disorders",
            ],
            contraindications: [
                "Systemic infections",
                "Live vaccines",
                "Peptic ulcer disease",
            ],
            sideEffects: [
                "Weight gain",
                "Mood changes",
                "Increased blood sugar",
                "Osteoporosis",
                "Increased infection risk",
            ],
            monitoring: [
                "Blood pressure",
                "Blood glucose",
                "Bone density",
                "Electrolytes",
            ],
        },
        Hydroxychloroquine: {
            class: "Disease-modifying antirheumatic drug (DMARD)",
            mechanism: "Immunomodulator with multiple effects",
            indications: [
                "Autoimmune conditions",
                "Severe chronic urticaria",
                "Rheumatoid arthritis",
            ],
            contraindications: [
                "Retinopathy",
                "G6PD deficiency",
                "Severe liver disease",
            ],
            sideEffects: [
                "Retinopathy",
                "GI upset",
                "Skin reactions",
                "Cardiac conduction disorders",
            ],
            monitoring: [
                "Regular eye examinations",
                "CBC",
                "Liver function",
                "ECG in high-risk patients",
            ],
        },
        Dapsone: {
            class: "Sulfone antibiotic",
            mechanism: "Anti-inflammatory and antimicrobial effects",
            indications: [
                "Severe chronic urticaria",
                "Dermatitis herpetiformis",
                "Leprosy",
            ],
            contraindications: [
                "G6PD deficiency",
                "Severe anemia",
                "Severe liver disease",
            ],
            sideEffects: [
                "Hemolysis",
                "Methemoglobinemia",
                "Agranulocytosis",
                "Peripheral neuropathy",
            ],
            monitoring: [
                "CBC weekly first month",
                "G6PD levels",
                "Liver function",
                "Methemoglobin levels",
            ],
        },
        Methotrexate: {
            class: "Disease-modifying antirheumatic drug (DMARD)",
            mechanism: "Folic acid antagonist with immunosuppressive effects",
            indications: [
                "Severe chronic urticaria",
                "Rheumatoid arthritis",
                "Psoriasis",
            ],
            contraindications: [
                "Pregnancy",
                "Liver disease",
                "Active infection",
                "Bone marrow suppression",
            ],
            sideEffects: [
                "Bone marrow suppression",
                "Hepatotoxicity",
                "GI upset",
                "Teratogenicity",
            ],
            monitoring: [
                "CBC",
                "Liver function",
                "Renal function",
                "Pregnancy testing",
            ],
        },
        Azathioprine: {
            class: "Immunosuppressant",
            mechanism: "Purine synthesis inhibitor",
            indications: [
                "Severe chronic urticaria",
                "Autoimmune conditions",
                "Transplant rejection prevention",
            ],
            contraindications: [
                "TPMT deficiency",
                "Active infection",
                "Pregnancy (relative)",
            ],
            sideEffects: [
                "Bone marrow suppression",
                "Increased infection risk",
                "Hepatotoxicity",
                "GI upset",
            ],
            monitoring: [
                "CBC",
                "Liver function",
                "TPMT testing before initiation",
                "Regular skin cancer screening",
            ],
        },
        Rituximab: {
            class: "Monoclonal antibody",
            mechanism: "Anti-CD20 B-cell depletion",
            indications: [
                "Severe refractory urticaria",
                "Autoimmune conditions",
                "Lymphoma",
            ],
            contraindications: [
                "Active severe infections",
                "Live vaccines",
                "Severe heart failure",
            ],
            sideEffects: [
                "Infusion reactions",
                "Increased infection risk",
                "Progressive multifocal leukoencephalopathy",
                "Hepatitis B reactivation",
            ],
            monitoring: [
                "CBC",
                "Immunoglobulin levels",
                "Hepatitis B screening",
                "Infection surveillance",
            ],
        },
    };
</script>

<Dialog.Root bind:open={isOpen}>
    <Dialog.Content class="max-w-2xl">
        <Dialog.Header>
            <Dialog.Title>{drugName}</Dialog.Title>
        </Dialog.Header>

        {#if drugDetails[drugName]}
            <div class="space-y-4">
                <div>
                    <h3 class="font-medium mb-2">Drug Class</h3>
                    <p class="text-sm text-muted-foreground">
                        {drugDetails[drugName].class}
                    </p>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Mechanism of Action</h3>
                    <p class="text-sm text-muted-foreground">
                        {drugDetails[drugName].mechanism}
                    </p>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Indications</h3>
                    <ul class="list-disc pl-4 text-sm text-muted-foreground">
                        {#each drugDetails[drugName].indications as indication}
                            <li>{indication}</li>
                        {/each}
                    </ul>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Contraindications</h3>
                    <ul class="list-disc pl-4 text-sm text-muted-foreground">
                        {#each drugDetails[drugName].contraindications as contraindication}
                            <li>{contraindication}</li>
                        {/each}
                    </ul>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Side Effects</h3>
                    <ul class="list-disc pl-4 text-sm text-muted-foreground">
                        {#each drugDetails[drugName].sideEffects as effect}
                            <li>{effect}</li>
                        {/each}
                    </ul>
                </div>

                <div>
                    <h3 class="font-medium mb-2">Monitoring</h3>
                    <ul class="list-disc pl-4 text-sm text-muted-foreground">
                        {#each drugDetails[drugName].monitoring as item}
                            <li>{item}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        {:else}
            <p class="text-muted-foreground">
                Details not available for this drug.
            </p>
        {/if}

        <Dialog.Footer>
            <Dialog.Close class="btn">Close</Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
