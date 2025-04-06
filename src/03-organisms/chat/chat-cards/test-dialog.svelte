<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";

    export let testName: string;
    export let isOpen: boolean;

    type TestDetail = {
        description: string;
        normalRange: string;
        interpretation: string[];
        indications: string[];
        interferingFactors: string[];
        sampleType: string;
        turnaroundTime: string;
        cost: "low" | "medium" | "high";
        clinicalPearls: string[];
        relatedTests: string[];
        category: "routine" | "specialized" | "diagnostic";
    };

    type TestDetails = {
        [key: string]: TestDetail;
    };

    const testDetails: TestDetails = {
        "Complement Levels (C3, C4)": {
            description:
                "Measures levels of complement proteins C3 and C4, key components of the complement system involved in immune response",
            normalRange: "C3: 90-180 mg/dL; C4: 10-40 mg/dL",
            interpretation: [
                "Low levels suggest active consumption (e.g., in vasculitis)",
                "Can be decreased in active SLE",
                "Serial measurements help track disease activity",
            ],
            indications: [
                "Suspected vasculitis",
                "SLE monitoring",
                "Immune complex diseases",
                "Hereditary complement deficiencies",
            ],
            interferingFactors: [
                "Recent infection",
                "Liver disease (reduced production)",
                "Nephrotic syndrome (urinary loss)",
                "Sample processing delay",
            ],
            sampleType: "Serum (gold/red top tube)",
            turnaroundTime: "1-2 days",
            cost: "medium",
            clinicalPearls: [
                "Must be processed quickly as levels degrade at room temperature",
                "Low C4 more specific for SLE than low C3",
                "Consider genetic testing if persistently low",
            ],
            relatedTests: ["CH50", "ANA", "Anti-dsDNA", "Urinalysis"],
            category: "specialized",
        },
        "Anti-dsDNA antibodies": {
            description:
                "Detects antibodies against double-stranded DNA, highly specific for SLE",
            normalRange: "Negative (<30 IU/mL)",
            interpretation: [
                "High specificity for SLE",
                "Levels correlate with disease activity",
                "Useful for monitoring treatment response",
            ],
            indications: [
                "SLE diagnosis",
                "Monitoring disease activity",
                "Evaluation of lupus nephritis",
                "ANA-positive patients",
            ],
            interferingFactors: [
                "Recent viral infection",
                "Certain medications",
                "Technical factors in assay",
            ],
            sampleType: "Serum",
            turnaroundTime: "2-4 days",
            cost: "high",
            clinicalPearls: [
                "Very high specificity (>95%) for SLE",
                "May predict renal involvement",
                "Serial measurements valuable for monitoring",
            ],
            relatedTests: [
                "ANA",
                "Complement levels",
                "Anti-Smith antibodies",
                "Urinalysis",
            ],
            category: "specialized",
        },
        Urinalysis: {
            description:
                "Comprehensive screening test examining physical, chemical, and microscopic properties of urine",
            normalRange: "Varies by parameter",
            interpretation: [
                "RBC/WBC casts suggest glomerulonephritis",
                "Protein indicates possible renal involvement",
                "Active sediment suggests inflammation",
            ],
            indications: [
                "Screening for kidney disease",
                "Monitoring known renal involvement",
                "Evaluation of hematuria/proteinuria",
                "Part of vasculitis workup",
            ],
            interferingFactors: [
                "Menstruation",
                "Exercise",
                "Dehydration",
                "Sample contamination",
                "Delayed processing",
            ],
            sampleType: "Clean-catch midstream urine",
            turnaroundTime: "Same day",
            cost: "low",
            clinicalPearls: [
                "First morning sample preferred",
                "Must be processed within 2 hours",
                "Consider microscopy if dipstick positive",
            ],
            relatedTests: [
                "Urine protein/creatinine ratio",
                "Complement levels",
                "Renal function tests",
            ],
            category: "routine",
        },
    };
</script>

<Dialog.Root bind:open={isOpen}>
    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                <span class="text-xl">{testName}</span>
                {#if testDetails[testName]}
                    <span
                        class="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700"
                    >
                        {testDetails[testName].category}
                    </span>
                    <span
                        class="px-2 py-1 rounded-full text-xs
                        {testDetails[testName].cost === 'high'
                            ? 'bg-red-100 text-red-700'
                            : testDetails[testName].cost === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'}"
                    >
                        {testDetails[testName].cost} cost
                    </span>
                {/if}
            </Dialog.Title>
        </Dialog.Header>

        {#if testDetails[testName]}
            <div class="grid grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-4">
                    <!-- Description -->
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-medium text-blue-800">Description</h3>
                        <p class="text-sm text-blue-700">
                            {testDetails[testName].description}
                        </p>
                    </div>

                    <!-- Basic Information -->
                    <div class="bg-white p-4 rounded-lg border">
                        <div class="mb-4">
                            <h3 class="text-sm font-medium text-slate-700">
                                Normal Range
                            </h3>
                            <p class="text-sm text-slate-600">
                                {testDetails[testName].normalRange}
                            </p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-slate-700">
                                Sample Type
                            </h3>
                            <p class="text-sm text-slate-600">
                                {testDetails[testName].sampleType}
                            </p>
                        </div>
                    </div>

                    <!-- Interpretation -->
                    <div class="bg-white p-4 rounded-lg border">
                        <h3 class="text-sm font-medium text-slate-700 mb-2">
                            Interpretation
                        </h3>
                        <ul class="text-sm text-slate-600 space-y-1">
                            {#each testDetails[testName].interpretation as point}
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-500">•</span>
                                    {point}
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                    <!-- Clinical Pearls -->
                    <div class="bg-amber-50 p-4 rounded-lg">
                        <h3 class="font-medium text-amber-800 mb-2">
                            💡 Clinical Pearls
                        </h3>
                        <ul class="text-sm text-amber-700 space-y-2">
                            {#each testDetails[testName].clinicalPearls as pearl}
                                <li>• {pearl}</li>
                            {/each}
                        </ul>
                    </div>

                    <!-- Interfering Factors -->
                    <div class="bg-white p-4 rounded-lg border">
                        <h3 class="text-sm font-medium text-red-700 mb-2">
                            ⚠️ Interfering Factors
                        </h3>
                        <ul class="text-sm text-slate-600 space-y-1">
                            {#each testDetails[testName].interferingFactors as factor}
                                <li class="flex items-center gap-2">
                                    <span class="text-red-500">•</span>
                                    {factor}
                                </li>
                            {/each}
                        </ul>
                    </div>

                    <!-- Related Tests -->
                    <div class="bg-slate-50 p-4 rounded-lg">
                        <h3 class="text-sm font-medium text-slate-700 mb-2">
                            Related Tests
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            {#each testDetails[testName].relatedTests as test}
                                <span
                                    class="px-2 py-1 bg-slate-200 rounded-full text-xs text-slate-700"
                                >
                                    {test}
                                </span>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <p class="text-muted-foreground">
                Details not available for this test.
            </p>
        {/if}

        <Dialog.Footer>
            <Dialog.Close class="btn">Close</Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
