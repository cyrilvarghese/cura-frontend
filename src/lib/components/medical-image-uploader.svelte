<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Upload, Search } from "lucide-svelte";
    import {
        testAssetService,
        type UploadTestAssetResponse,
    } from "$lib/services/testAssetService";
    import { authStore, type AuthState } from "$lib/stores/authStore";

    const {
        caseId,
        testName,
        testType,
        onStart,
        onSuccess,
        onError,
        showHeader = true,
    } = $props<{
        caseId: string;
        testName: string;
        testType: "physical_exam" | "lab_test";
        onStart: () => void;
        onSuccess: (response: UploadTestAssetResponse) => void;
        onError: (error: string) => void;
        onRemove?: () => void;
        uploadedImages?: { url: string; id?: string }[];
        showHeader?: boolean;
    }>();

    let searchDialogOpen = $state(false);
    let isUploading = $state(false);
    let uploadProgress = $state(0);
    let totalFiles = $state(0);
    let completedFiles = $state(0);

    async function handleFilesUpload(files: FileList) {
        if (!files.length) return;

        try {
            onStart();
            isUploading = true;
            totalFiles = files.length;
            completedFiles = 0;

            // Convert FileList to array
            const fileArray = Array.from(files);

            // Send all files in a single API call
            const response = await testAssetService.uploadMultipleTestAssets(
                fileArray,
                caseId,
                testName,
                testType,
            );

            // Assuming the API returns an array of responses, one for each file
            if (Array.isArray(response)) {
                completedFiles = response.length;
                uploadProgress = 100;

                // Call onSuccess for each file response
                response.forEach((fileResponse) => {
                    onSuccess(fileResponse);
                });
            } else {
                // If API returns a single response for all files
                onSuccess(response);
            }
        } catch (error) {
            console.error("Upload process failed:", error);
            onError("Failed to upload images");
        } finally {
            isUploading = false;
        }
    }

    async function uploadImageFromUrl(imageUrl: string) {
        try {
            onStart();
            const response = await testAssetService.uploadTestAssetFromUrl({
                case_id: caseId,
                test_name: testName,
                test_type: testType,
                image_url: imageUrl,
            });
            onSuccess(response);
        } catch (error) {
            console.error("URL upload failed:", error);
            onError("Failed to upload image from URL");
        }
    }

    function handlePaste(event: ClipboardEvent) {
        const items = event.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];

        for (const item of items) {
            if (item.type.startsWith("image")) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            // Handle each image file individually
            imageFiles.forEach((file) => {
                const dt = new DataTransfer();
                dt.items.add(file);
                handleFilesUpload(dt.files);
            });
        }
    }
</script>

<div
    class="w-full h-full min-h-[200px] flex items-center justify-start bg-muted rounded-md"
>
    <div class="w-full space-y-4 p-4 border rounded-md">
        {#if showHeader}
            <h3 class="text-lg font-medium mb-4">Add Images</h3>
        {/if}

        <!-- Paste Area -->
        <div class="space-y-2">
            <label for="paste-area" class="block text-sm font-medium">
                Paste image
            </label>
            <textarea
                id="paste-area"
                class="min-h-[100px] w-full border-2 border-dashed rounded-lg p-4 resize-none cursor-text hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onpaste={handlePaste}
                placeholder="Click here and paste an image (Ctrl+V)"
                aria-label="Paste image area"
                rows="3"
            ></textarea>
        </div>

        <!-- File Upload Option -->
        <div class="space-y-2">
            <label for="file-upload" class="block text-sm font-medium">
                Upload from device
            </label>
            <div class="flex items-center gap-2">
                <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    multiple
                    class="hidden"
                    onchange={(e) => {
                        const files = e.currentTarget.files;
                        if (files && files.length > 0) {
                            handleFilesUpload(files);
                        }
                    }}
                />
                <Button
                    variant="outline"
                    class="gap-2"
                    onclick={() => {
                        document.getElementById("file-upload")?.click();
                    }}
                >
                    <Upload class="h-4 w-4" />
                    Choose Files
                </Button>
            </div>

            {#if isUploading}
                <div class="w-full mt-2">
                    <div class="text-xs text-muted-foreground mb-1">
                        Uploading {completedFiles} of {totalFiles} files ({uploadProgress}%)
                    </div>
                    <div class="w-full bg-muted rounded-full h-2">
                        <div
                            class="bg-primary h-2 rounded-full"
                            style="width: {uploadProgress}%"
                        ></div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- URL Input Option
        <div class="space-y-2">
            <label for="image-url" class="block text-sm font-medium">
                Enter image URL
            </label>
            <div class="flex gap-2">
                <input
                    type="url"
                    id="image-url"
                    placeholder="Enter a link to an image to add"
                    class="flex-1 px-3 py-2 border rounded-md bg-white"
                />
                <Button
                    variant="outline"
                    onclick={() => {
                        const url = (
                            document.getElementById(
                                "image-url",
                            ) as HTMLInputElement
                        )?.value;
                        if (url) {
                            uploadImageFromUrl(url);
                        }
                    }}
                >
                    Add
                </Button>
            </div> -->
        <!-- </div> -->

        <!-- Search Images Button -->
        <!-- <div class="space-y-2">
            <Button
                variant="outline"
                class="gap-2 w-full"
                onclick={() => openSearchDialog()}
            >
                <Search class="h-4 w-4" />
                Search Medical Images
            </Button>
        </div> -->
    </div>
</div>
<!-- 
<MedicalImageSearch
    bind:open={searchDialogOpen}
    onSelectImage={handleSearchSuccess}
    {caseId}
/> -->
