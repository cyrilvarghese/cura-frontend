<script lang="ts">
    import { onMount } from "svelte";
    import * as Select from "$lib/components/ui/select";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { caseDataStore } from "$lib/stores/casePlayerStore";

    const predefinedDiagnoses = [
        "Urticarial Vasculitis",
        "Systemic Lupus Erythematosus (SLE)",
        "Hypersensitivity Vasculitis",
        "Chronic Idiopathic Urticaria",
        "Drug-Induced Urticarial Rash",
    ];
    // Subscribe to caseDataStore changes using $ syntax
    $effect(() => {
        console.log("caseDataStore changed");
        console.log($caseDataStore);
        if ($caseDataStore?.coverMessage?.differentials) {
            diagnoses = $caseDataStore.coverMessage.differentials.map(
                (diagnosis: string, index: number) => ({
                    id: index.toString(),
                    text: diagnosis,
                    isPrimary: false,
                    isIrrelevant: false,
                    status: "differential",
                    justification: undefined,
                }),
            );
        }
    });

    type DiagnosisStatus = "primary" | "differential" | "ruled-out";

    interface Diagnosis {
        id: string;
        text: string;
        isPrimary: boolean;
        isIrrelevant?: boolean;
        status: DiagnosisStatus;
        justification?: string;
    }

    let { diagnoses = $bindable() } = $props<{ diagnoses: Diagnosis[] }>();

    // onMount(() => {
    //     if (!diagnoses || diagnoses.length === 0) {
    //         diagnoses = predefinedDiagnoses.map((text) => ({
    //             id: crypto.randomUUID(),
    //             text,
    //             isPrimary: false,
    //             isIrrelevant: false,
    //             status: "differential",
    //         }));
    //     }
    // });

    function updateDiagnosisStatus(id: string, newStatus: DiagnosisStatus) {
        if (newStatus === "primary") {
            diagnoses = diagnoses.map((d: Diagnosis) => ({
                ...d,
                status:
                    d.id === id
                        ? newStatus
                        : d.status === "primary"
                          ? "differential"
                          : d.status,
                isPrimary: d.id === id,
                isIrrelevant: false,
                justification: d.id === id ? d.justification : undefined,
            }));
        } else {
            diagnoses = diagnoses.map((d: Diagnosis) => ({
                ...d,
                status: d.id === id ? newStatus : d.status,
                isPrimary: d.id === id ? false : d.isPrimary,
                isIrrelevant: newStatus === "ruled-out",
                justification: d.id === id ? undefined : d.justification,
            }));
        }
    }

    function updateJustification(id: string, justification: string) {
        diagnoses = diagnoses.map((d: Diagnosis) =>
            d.id === id ? { ...d, justification } : d,
        );
    }

    function isDiagnosisStatus(value: string): value is DiagnosisStatus {
        return ["primary", "secondary", "differential", "ruled-out"].includes(
            value,
        );
    }
</script>

<div class="space-y-4">
    {#if diagnoses && diagnoses.length > 0}
        {#each diagnoses as diagnosis}
            <div class="flex flex-col space-y-2 py-2 border-b">
                <div class="flex items-center space-x-3">
                    <div class="flex-1 flex items-center justify-between gap-4">
                        <Label
                            class="text-base flex-1 {diagnosis.status ===
                            'ruled-out'
                                ? 'line-through text-gray-400'
                                : ''}"
                        >
                            {diagnosis.text}
                        </Label>
                        <Select.Root
                            type="single"
                            value={diagnosis.status}
                            onValueChange={(value: string) => {
                                if (isDiagnosisStatus(value)) {
                                    updateDiagnosisStatus(diagnosis.id, value);
                                }
                            }}
                        >
                            <Select.Trigger class="w-[180px]">
                                <span
                                    class={diagnosis.status === "primary"
                                        ? "text-green-600"
                                        : diagnosis.status === "ruled-out"
                                          ? "text-gray-400"
                                          : ""}
                                >
                                    {diagnosis.status.charAt(0).toUpperCase() +
                                        diagnosis.status.slice(1)}
                                </span>
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="primary"
                                    >Primary</Select.Item
                                >
                                <Select.Item value="differential">
                                    Differential
                                </Select.Item>
                                <Select.Item value="ruled-out">
                                    Ruled Out
                                </Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </div>
                </div>

                {#if diagnosis.status === "primary"}
                    <div class="ml-0 mt-2">
                        <Textarea
                            placeholder="Please provide justification for your primary diagnosis..."
                            value={diagnosis.justification || ""}
                            oninput={(e) =>
                                updateJustification(
                                    diagnosis.id,
                                    e.currentTarget.value,
                                )}
                            class="min-h-[100px]"
                        />
                    </div>
                {/if}
            </div>
        {/each}

        <div class="text-sm text-muted-foreground mt-2">
            <p>
                Select the status for each diagnosis using the dropdown menu.
                Provide justification for your primary diagnosis.
            </p>
        </div>
    {/if}
</div>
