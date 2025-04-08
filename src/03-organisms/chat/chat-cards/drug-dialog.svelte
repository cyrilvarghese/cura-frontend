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
        clinicalContext: string;
        specialPopulations: {
            renal?: string;
            pregnancy?: string;
            elderly?: string;
        };
        category: "first-line" | "second-line" | "severe";
        requiresMonitoring: boolean;
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
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
            clinicalContext:
                "Non-sedating antihistamine preferred for daytime use. Less anticholinergic effects compared to first-generation agents.",
            specialPopulations: {
                renal: "Fexofenadine needs dose adjustment in renal impairment",
                pregnancy: "Category B - preferred antihistamine in pregnancy",
                elderly:
                    "Preferred over first-generation due to less anticholinergic effects",
            },
            category: "first-line",
            requiresMonitoring: false,
        },
        Ibuprofen: {
            class: "NSAID (Non-steroidal anti-inflammatory drug)",
            mechanism: "COX-1 and COX-2 inhibitor",
            indications: [
                "Pain",
                "Inflammation",
                "Fever",
                "Acute urticaria with angioedema",
            ],
            contraindications: [
                "Active GI bleeding",
                "Severe heart failure",
                "Third trimester pregnancy",
                "CrCl < 30 mL/min",
            ],
            sideEffects: [
                "GI ulceration/bleeding",
                "Increased blood pressure",
                "Acute kidney injury",
                "Platelet dysfunction",
            ],
            monitoring: [
                "Blood pressure",
                "Renal function",
                "GI symptoms",
                "CBC if long-term use",
            ],
            clinicalContext:
                "Useful for inflammatory conditions with pain component. Consider GI prophylaxis in high-risk patients.",
            specialPopulations: {
                renal: "Avoid if CrCl < 30ml/min, use with caution if 30-60ml/min",
                pregnancy:
                    "Contraindicated in 3rd trimester, caution in 1st/2nd",
                elderly:
                    "Higher risk of GI/renal complications, use lowest effective dose",
            },
            category: "first-line",
            requiresMonitoring: true,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
        },
        Prednisolone: {
            class: "Corticosteroid",
            mechanism:
                "Multiple anti-inflammatory and immunosuppressive effects",
            indications: [
                "Severe allergic reactions",
                "Refractory urticaria",
                "Autoimmune conditions",
                "Acute asthma exacerbations",
            ],
            contraindications: [
                "Active untreated infections",
                "Live vaccines",
                "Systemic fungal infections",
            ],
            sideEffects: [
                "Hyperglycemia",
                "Hypertension",
                "Osteoporosis",
                "Adrenal suppression",
                "Increased infection risk",
            ],
            monitoring: [
                "Blood glucose",
                "Blood pressure",
                "Electrolytes",
                "Bone density if long-term",
            ],
            clinicalContext:
                "Rapid-acting anti-inflammatory for severe symptoms. Requires careful tapering if used > 2 weeks.",
            specialPopulations: {
                renal: "No dose adjustment needed, but monitor fluid/electrolytes",
                pregnancy: "Category C - use if benefit outweighs risk",
                elderly: "Higher risk of side effects, especially osteoporosis",
            },
            category: "second-line",
            requiresMonitoring: true,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
        },
        Methotrexate: {
            class: "Disease-modifying antirheumatic drug (DMARD)",
            mechanism: "Folate antagonist with immunomodulatory effects",
            indications: [
                "Severe chronic urticaria",
                "Rheumatoid arthritis",
                "Severe psoriasis",
            ],
            contraindications: [
                "Pregnancy/planning pregnancy",
                "Active infection",
                "Significant liver disease",
                "Bone marrow suppression",
            ],
            sideEffects: [
                "Bone marrow suppression",
                "Hepatotoxicity",
                "Pulmonary toxicity",
                "Teratogenicity",
                "Oral ulcers",
            ],
            monitoring: [
                "CBC weekly for first month, then monthly",
                "Liver function tests monthly",
                "Chest X-ray baseline",
                "Pregnancy test before starting",
            ],
            clinicalContext:
                "Reserved for severe refractory cases. Requires careful monitoring and mandatory contraception.",
            specialPopulations: {
                renal: "Reduce dose if CrCl < 60ml/min, avoid if < 30ml/min",
                pregnancy: "Absolutely contraindicated - teratogenic",
                elderly: "Higher risk of toxicity, consider dose reduction",
            },
            category: "severe",
            requiresMonitoring: true,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
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
            clinicalContext:
                "Helps reduce histamine-driven wheals and itching. First-line choice for chronic urticaria due to favorable safety profile.",
            specialPopulations: {
                renal: "Reduce dose by 50% if CrCl < 30ml/min",
                pregnancy: "Category B - generally considered safe",
                elderly: "No routine dose adjustment needed",
            },
            category: "first-line",
            requiresMonitoring: false,
        },
    };
</script>

<Dialog.Root bind:open={isOpen}>
    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                <span class="text-xl">{drugName}</span>
                {#if drugDetails[drugName]}
                    {#if drugDetails[drugName].requiresMonitoring}
                        <span class="text-amber-500 text-sm"
                            >🧪 Monitoring Required</span
                        >
                    {/if}
                    <span
                        class="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700"
                    >
                        {drugDetails[drugName].category}
                    </span>
                {/if}
            </Dialog.Title>
        </Dialog.Header>

        {#if drugDetails[drugName]}
            <div class="grid grid-cols-2 gap-6">
                <!-- Left Column - Core Information -->
                <div class="space-y-4">
                    <!-- Clinical Context Card -->
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-medium text-blue-800">
                            Clinical Context
                        </h3>
                        <p class="text-sm text-blue-700">
                            {drugDetails[drugName].clinicalContext}
                        </p>
                    </div>

                    <!-- Basic Information -->
                    <div class="bg-white p-4 rounded-lg border">
                        <div class="mb-4">
                            <h3 class="text-sm font-medium text-slate-700">
                                Drug Class
                            </h3>
                            <p class="text-sm text-slate-600">
                                {drugDetails[drugName].class}
                            </p>
                        </div>

                        <div>
                            <h3 class="text-sm font-medium text-slate-700">
                                Mechanism
                            </h3>
                            <p class="text-sm text-slate-600">
                                {drugDetails[drugName].mechanism}
                            </p>
                        </div>
                    </div>

                    <!-- Indications & Contraindications -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg border">
                            <h3 class="text-sm font-medium text-slate-700 mb-2">
                                Indications
                            </h3>
                            <ul class="text-sm text-slate-600 space-y-1">
                                {#each drugDetails[drugName].indications as indication}
                                    <li class="flex items-center gap-2">
                                        <span class="text-green-500">•</span>
                                        {indication}
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        <div class="bg-white p-4 rounded-lg border">
                            <h3 class="text-sm font-medium text-red-700 mb-2">
                                Contraindications
                            </h3>
                            <ul class="text-sm text-slate-600 space-y-1">
                                {#each drugDetails[drugName].contraindications as contraindication}
                                    <li class="flex items-center gap-2">
                                        <span class="text-red-500">⚠️</span>
                                        {contraindication}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Additional Information -->
                <div class="space-y-4">
                    <!-- Special Populations -->
                    <div class="bg-white p-4 rounded-lg border">
                        <h3 class="text-sm font-medium text-slate-700 mb-2">
                            Special Populations
                        </h3>
                        <div class="space-y-2">
                            {#each Object.entries(drugDetails[drugName].specialPopulations) as [population, info]}
                                <div>
                                    <span
                                        class="text-sm font-medium text-slate-600"
                                        >{population}:</span
                                    >
                                    <span class="text-sm text-slate-600 ml-1"
                                        >{info}</span
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>

                    <!-- Side Effects & Monitoring -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg border">
                            <h3 class="text-sm font-medium text-slate-700 mb-2">
                                Side Effects
                            </h3>
                            <ul class="text-sm text-slate-600 space-y-1">
                                {#each drugDetails[drugName].sideEffects as effect}
                                    <li class="flex items-center gap-2">
                                        <span class="text-yellow-500">•</span>
                                        {effect}
                                    </li>
                                {/each}
                            </ul>
                        </div>

                        <div class="bg-white p-4 rounded-lg border">
                            <h3 class="text-sm font-medium text-slate-700 mb-2">
                                Monitoring
                            </h3>
                            <ul class="text-sm text-slate-600 space-y-1">
                                {#each drugDetails[drugName].monitoring as item}
                                    <li class="flex items-center gap-2">
                                        <span class="text-blue-500">•</span>
                                        {item}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
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
