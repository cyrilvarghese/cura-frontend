<script lang="ts">
    import { Plus } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Select from "$lib/components/ui/select";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import MedicalImageUploader from "$lib/components/medical-image-uploader.svelte";
    import MedicalImageViewer from "$lib/components/medical-image-viewer.svelte";
    import { editExamStore } from "$lib/stores/editExamStore";
    import type { ExaminationResult, FindingContent } from "$lib/types/index";

    let {
        caseId,
        onSuccess,
        open = $bindable(),
        editData = undefined,
    } = $props<{
        caseId: string;
        onSuccess?: (examName: string, examData: any) => void;
        open?: boolean;
        editData?: ExaminationResult;
    }>();

    // Local state to manage dialog open/close
    let isDialogOpen = $state(false);

    // Check if we're in edit mode
    const isEditMode = $derived(!!editData);

    // Sync with parent prop
    $effect(() => {
        isDialogOpen = open ?? false;
    });

    $effect(() => {
        if (open !== isDialogOpen) {
            open = isDialogOpen;
        }
    });

    // Clear state when dialog opens
    $effect(() => {
        if (isDialogOpen) {
            if (isEditMode) {
                populateFormWithEditData();
            } else {
                resetForm();
            }
        }
    });

    // State for add/edit physical exam dialog
    let examName = $state("");
    let examPurpose = $state("");
    let examType = $state<"text" | "mixed">("text");
    let textFindings = $state("");
    let interpretation = $state("");
    let uploadedImages = $state<{ url: string; id?: string }[]>([]);
    let isUploading = $state(false);

    // Subscribe to store state
    const { isLoading: isAddingExam, error: addExamError } =
        $derived($editExamStore);

    function populateFormWithEditData() {
        if (!editData) return;

        examName = editData.name;
        examPurpose = editData.purpose || "";
        interpretation = editData.interpretation || "";

        const findings = editData.findings as FindingContent;

        if (findings?.type === "text") {
            examType = "text";
            textFindings = findings.content || "";
            uploadedImages = [];
        } else if (findings?.type === "mixed") {
            examType = "mixed";
            // Extract text content and images from mixed content
            const textContent = findings.content?.find(
                (item) => item.type === "text",
            );
            textFindings = textContent?.content || "";

            const imageContents =
                findings.content?.filter((item) => item.type === "image") || [];
            uploadedImages = imageContents.flatMap((item) =>
                Array.isArray(item.content?.url)
                    ? item.content.url.map((url) => ({ url }))
                    : item.content?.url
                      ? [{ url: item.content.url }]
                      : [],
            );
        } else {
            // Default to text if type is unclear
            examType = "text";
            textFindings = typeof findings === "string" ? findings : "";
            uploadedImages = [];
        }
    }

    async function handleSubmit() {
        if (!examName.trim()) return;

        const finalInterpretation =
            interpretation.trim() || "Examination completed successfully";

        try {
            let response;
            if (examType === "text") {
                if (isEditMode) {
                    // TODO: Implement edit text exam API call when available
                    console.log("Edit text exam:", {
                        examName,
                        examPurpose,
                        textFindings,
                        finalInterpretation,
                    });
                } else {
                    response = await editExamStore.addTextExam({
                        case_id: caseId,
                        test_name: examName,
                        purpose: examPurpose,
                        text_content: textFindings,
                        interpretation: finalInterpretation,
                        status: "completed",
                    });
                }
            } else {
                if (isEditMode) {
                    // TODO: Implement edit mixed exam API call when available
                    console.log("Edit mixed exam:", {
                        examName,
                        examPurpose,
                        textFindings,
                        finalInterpretation,
                        images: uploadedImages,
                    });
                } else {
                    response = await editExamStore.addMixedExam({
                        case_id: caseId,
                        test_name: examName,
                        purpose: examPurpose,
                        text_content: textFindings,
                        interpretation: finalInterpretation,
                        status: "completed",
                        url: uploadedImages.map((img) => img.url),
                    });
                }
            }

            // Call success callback with formatted exam data for UI update
            const updatedExamData = {
                purpose: examPurpose,
                findings:
                    examType === "text"
                        ? { type: "text", content: textFindings }
                        : {
                              type: "mixed",
                              content: [
                                  ...(textFindings
                                      ? [
                                            {
                                                type: "text",
                                                content: textFindings,
                                            },
                                        ]
                                      : []),
                                  ...uploadedImages.map((img) => ({
                                      type: "image",
                                      content: {
                                          url: [img.url],
                                          altText: "Examination image",
                                      },
                                  })),
                              ],
                          },
                status: "completed",
                interpretation: finalInterpretation,
                comments: editData?.comments || [],
            };

            onSuccess?.(examName, updatedExamData);

            resetForm();
            isDialogOpen = false;
        } catch (error) {
            console.error(
                `Failed to ${isEditMode ? "edit" : "add"} examination:`,
                error,
            );
        }
    }

    function resetForm() {
        examName = "";
        examPurpose = "";
        examType = "text";
        textFindings = "";
        interpretation = "";
        uploadedImages = [];
    }

    function handleUploadStart() {
        isUploading = true;
    }

    function handleUploadSuccess(response: any) {
        console.log("Upload success:", response);
        if (response.image_urls && Array.isArray(response.image_urls)) {
            uploadedImages = [
                ...uploadedImages,
                ...response.image_urls.map((url: string) => ({ url })),
            ];
        } else if (response.file_path) {
            uploadedImages = [...uploadedImages, { url: response.file_path }];
        }
        isUploading = false;
    }

    function handleUploadError(error: string) {
        console.error("Upload error:", error);
        isUploading = false;
    }
</script>

<!-- Add/Edit Physical Exam Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title
                >{isEditMode ? "Edit" : "Add"} Physical Examination</Dialog.Title
            >
            <Dialog.Description>
                {isEditMode ? "Edit the" : "Add a new"} physical examination with
                text findings or mixed content including images.
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4">
            <!-- Exam Name -->
            <div class="space-y-2">
                <Label for="exam-name">Examination Name</Label>
                <Input
                    id="exam-name"
                    bind:value={examName}
                    placeholder="e.g., Skin Examination, Neurological Assessment"
                    disabled={isEditMode}
                />
            </div>

            <!-- Exam Purpose and Type Row -->
            <div class="flex gap-4">
                <!-- Exam Purpose -->
                <div class="flex-1 space-y-2">
                    <Label for="exam-purpose">Purpose</Label>
                    <Input
                        id="exam-purpose"
                        bind:value={examPurpose}
                        placeholder="Purpose of this examination"
                    />
                </div>

                <!-- Exam Type Selection -->
                <div class="flex-1 space-y-2">
                    <Label>Examination Type</Label>
                    <Select.Root type="single" bind:value={examType}>
                        <Select.Trigger class="w-full">
                            {examType === "text"
                                ? "Text Only"
                                : examType === "mixed"
                                  ? "Mixed (Text + Images)"
                                  : "Select examination type"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                <Select.Item value="text" label="Text Only">
                                    Text Only
                                </Select.Item>
                                <Select.Item
                                    value="mixed"
                                    label="Mixed (Text + Images)"
                                >
                                    Mixed (Text + Images)
                                </Select.Item>
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>

            <!-- Text Findings and Interpretation Row -->
            <div class="flex gap-4">
                <!-- Text Findings -->
                <div class="flex-1 space-y-2">
                    <Label for="text-findings">
                        {examType === "mixed"
                            ? "Text Findings (Optional)"
                            : "Findings"}
                    </Label>
                    <Textarea
                        id="text-findings"
                        bind:value={textFindings}
                        placeholder="Enter examination findings..."
                        rows="4"
                    />
                </div>

                <!-- Interpretation -->
                <div class="flex-1 space-y-2">
                    <Label for="interpretation">Interpretation</Label>
                    <Textarea
                        id="interpretation"
                        bind:value={interpretation}
                        placeholder="Examination completed successfully (default if left empty)"
                        rows="4"
                    />
                </div>
            </div>

            <!-- Image Upload for Mixed Type -->
            {#if examType === "mixed"}
                <div class="space-y-2">
                    <Label>Medical Images</Label>
                    <div class="border rounded-lg p-4">
                        {#if uploadedImages.length > 0}
                            <div class="mb-4">
                                <MedicalImageViewer
                                    imageUrls={uploadedImages.map(
                                        (img) => img.url,
                                    )}
                                    altText="Examination Images"
                                    {caseId}
                                    testName={examName || "New Exam"}
                                    testType="physical_exam"
                                    onUploadSuccess={handleUploadSuccess}
                                    onUploadError={handleUploadError}
                                />
                            </div>
                        {:else}
                            <MedicalImageUploader
                                {caseId}
                                testName={examName || "New Exam"}
                                testType="physical_exam"
                                onStart={handleUploadStart}
                                onSuccess={handleUploadSuccess}
                                onError={handleUploadError}
                            />
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Error Display -->
            {#if addExamError}
                <div
                    class="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                    {addExamError}
                </div>
            {/if}
        </div>

        <Dialog.Footer class="flex justify-between">
            <Button
                variant="outline"
                onclick={() => {
                    resetForm();
                    isDialogOpen = false;
                }}
            >
                Cancel
            </Button>
            <Button
                onclick={handleSubmit}
                disabled={!examName.trim() ||
                    isUploading ||
                    isAddingExam ||
                    (examType === "mixed" && uploadedImages.length === 0)}
            >
                {isAddingExam
                    ? `${isEditMode ? "Updating" : "Adding"}...`
                    : isUploading
                      ? "Uploading..."
                      : `${isEditMode ? "Update" : "Add"} Examination`}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
