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
    import type { TestResult, TestResultContent } from "$lib/types/index";

    let {
        caseId,
        onSuccess,
        open = $bindable(),
        editData = undefined,
    } = $props<{
        caseId: string;
        onSuccess?: (testName: string, testData: any) => void;
        open?: boolean;
        editData?: TestResult;
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

    // State for add/edit lab test dialog
    let testName = $state("");
    let testPurpose = $state("");
    let testType = $state<"text" | "mixed">("text");
    let textContent = $state("");
    let interpretation = $state("");
    let uploadedImages = $state<{ url: string; id?: string }[]>([]);
    let isUploading = $state(false);

    // Subscribe to store state
    const { isLoading: isAddingTest, error: addTestError } =
        $derived($editExamStore);

    function populateFormWithEditData() {
        if (!editData) return;

        testName = editData.testName;
        testPurpose = editData.purpose || "";
        interpretation = editData.interpretation || "";

        const results = editData.results as TestResultContent;

        if (results?.type === "text") {
            testType = "text";
            textContent = results.content || "";
            uploadedImages = [];
        } else if (results?.type === "mixed") {
            testType = "mixed";
            // Extract text content and images from mixed content
            const textContentItem = results.content?.find(
                (item) => item.type === "text",
            );
            textContent = textContentItem?.content || "";

            const imageContents =
                results.content?.filter((item) => item.type === "image") || [];
            uploadedImages = imageContents.flatMap((item) =>
                Array.isArray(item.content?.url)
                    ? item.content.url.map((url) => ({ url }))
                    : item.content?.url
                      ? [{ url: item.content.url }]
                      : [],
            );
        } else {
            // Default to text if type is unclear
            testType = "text";
            textContent = typeof results === "string" ? results : "";
            uploadedImages = [];
        }
    }

    async function handleSubmit() {
        if (!testName.trim()) return;

        const finalInterpretation = interpretation.trim() || "";

        try {
            let response;
            if (testType === "text") {
                if (isEditMode) {
                    response = await editExamStore.editTextLabTest({
                        case_id: caseId,
                        test_name: testName,
                        purpose: testPurpose,
                        text_content: textContent,
                        interpretation: finalInterpretation,
                        status: "completed",
                    });
                } else {
                    response = await editExamStore.addTextLabTest({
                        case_id: caseId,
                        test_name: testName,
                        purpose: testPurpose,
                        text_content: textContent,
                        interpretation: finalInterpretation,
                        status: "completed",
                    });
                }
            } else {
                if (isEditMode) {
                    response = await editExamStore.editMixedLabTest({
                        case_id: caseId,
                        test_name: testName,
                        purpose: testPurpose,
                        text_content: textContent,
                        url: uploadedImages.map((img) => img.url),
                        interpretation: finalInterpretation,
                        status: "completed",
                    });
                } else {
                    response = await editExamStore.addMixedLabTest({
                        case_id: caseId,
                        test_name: testName,
                        purpose: testPurpose,
                        text_content: textContent,
                        interpretation: finalInterpretation,
                        status: "completed",
                        url: uploadedImages.map((img) => img.url),
                    });
                }
            }

            // Call success callback with formatted test data for UI update
            const updatedTestData = {
                purpose: testPurpose,
                results:
                    testType === "text"
                        ? { type: "text", content: textContent }
                        : {
                              type: "mixed",
                              content: [
                                  ...(textContent
                                      ? [
                                            {
                                                type: "text",
                                                content: textContent,
                                            },
                                        ]
                                      : []),
                                  ...uploadedImages.map((img) => ({
                                      type: "image",
                                      content: {
                                          url: [img.url],
                                          altText: "Lab test image",
                                      },
                                  })),
                              ],
                          },
                status: "completed",
                interpretation: finalInterpretation,
                comments: editData?.comments || [],
            };

            onSuccess?.(testName, updatedTestData);

            resetForm();
            isDialogOpen = false;
        } catch (error) {
            console.error(
                `Failed to ${isEditMode ? "edit" : "add"} lab test:`,
                error,
            );
        }
    }

    function resetForm() {
        testName = "";
        testPurpose = "";
        testType = "text";
        textContent = "";
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

<!-- Add/Edit Lab Test Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>{isEditMode ? "Edit" : "Add"} Lab Test</Dialog.Title>
            <Dialog.Description>
                {isEditMode ? "Edit the" : "Add a new"} lab test with text results
                or mixed content including images.
            </Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4">
            <!-- Test Name -->
            <div class="space-y-2">
                <Label for="test-name">Lab Test Name</Label>
                <Input
                    id="test-name"
                    bind:value={testName}
                    placeholder="e.g., Blood Work, CBC, Urinalysis"
                    disabled={isEditMode}
                />
            </div>

            <!-- Test Purpose and Type Row -->
            <div class="flex gap-4">
                <!-- Test Purpose -->
                <div class="flex-1 space-y-2">
                    <Label for="test-purpose">Purpose</Label>
                    <Input
                        id="test-purpose"
                        bind:value={testPurpose}
                        placeholder="Purpose of this lab test"
                    />
                </div>

                <!-- Test Type Selection -->
                <div class="flex-1 space-y-2">
                    <Label>Test Type</Label>
                    <Select.Root type="single" bind:value={testType}>
                        <Select.Trigger class="w-full">
                            {testType === "text"
                                ? "Text Only"
                                : testType === "mixed"
                                  ? "Mixed (Text + Images)"
                                  : "Select test type"}
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

            <!-- Text Results and Interpretation Row -->
            <div class="flex gap-4">
                <!-- Text Results -->
                <div class="flex-1 space-y-2">
                    <Label for="text-content">
                        {testType === "mixed"
                            ? "Text Results (Optional)"
                            : "Test Results"}
                    </Label>
                    <Textarea
                        id="text-content"
                        bind:value={textContent}
                        placeholder="Enter lab test results..."
                        rows="4"
                    />
                </div>

                <!-- Interpretation -->
                <div class="flex-1 space-y-2">
                    <Label for="interpretation">Interpretation</Label>
                    <Textarea
                        id="interpretation"
                        bind:value={interpretation}
                        placeholder="Test interpretation (optional)"
                        rows="4"
                    />
                </div>
            </div>

            <!-- Image Upload for Mixed Type -->
            {#if testType === "mixed"}
                <div class="space-y-2">
                    <Label>Lab Test Images</Label>
                    <div class="border rounded-lg p-4">
                        {#if uploadedImages.length > 0}
                            <div class="mb-4">
                                <MedicalImageViewer
                                    imageUrls={uploadedImages.map(
                                        (img) => img.url,
                                    )}
                                    altText="Lab Test Images"
                                    {caseId}
                                    testName={testName || "New Lab Test"}
                                    testType="lab_test"
                                    onUploadSuccess={handleUploadSuccess}
                                    onUploadError={handleUploadError}
                                />
                            </div>
                        {:else}
                            <MedicalImageUploader
                                {caseId}
                                testName={testName || "New Lab Test"}
                                testType="lab_test"
                                onStart={handleUploadStart}
                                onSuccess={handleUploadSuccess}
                                onError={handleUploadError}
                            />
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Error Display -->
            {#if addTestError}
                <div
                    class="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                    {addTestError}
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
                disabled={!testName.trim() || isUploading || isAddingTest}
            >
                {isAddingTest
                    ? `${isEditMode ? "Updating" : "Adding"}...`
                    : isUploading
                      ? "Uploading..."
                      : `${isEditMode ? "Update" : "Add"} Lab Test`}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
