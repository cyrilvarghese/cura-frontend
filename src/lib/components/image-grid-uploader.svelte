<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Upload, X, Image } from "lucide-svelte";
    import {
        testAssetService,
        type UploadTestAssetResponse,
    } from "$lib/services/testAssetService";
    import { API_BASE_URL } from "$lib/config/api";
    
    const {
        imageUrls = [],
        altText = "Uploaded image for test",
        caseId,
        testName,
        testType,   
        onUploadSuccess,
        onUploadError,
        columns = 3,
        maxImages = 9,
    } = $props<{
        imageUrls?: string[];
        altText?: string;
        caseId: string;
        testName: string;
        testType: "physical_exam" | "lab_test";
        onUploadSuccess?: (response: UploadTestAssetResponse) => void;
        onUploadError?: (error: string) => void;
        columns?: 2 | 3 | 4;
        maxImages?: number;
    }>();

    // Store images as an array
    let currentImageUrls = $state<string[]>([...imageUrls]);
    let isUploading = $state(false);
    let uploadError = $state<string | null>(null);

    async function handleFileUpload(files: FileList) {
        try {
            isUploading = true;
            uploadError = null;
            
            // Process each file up to the maximum allowed
            const remainingSlots = maxImages - currentImageUrls.length;
            const filesToUpload = Math.min(files.length, remainingSlots);
            
            for (let i = 0; i < filesToUpload; i++) {
                const file = files[i];
                const response = await testAssetService.uploadTestAsset(
                    file,
                    caseId,
                    testName,
                    testType,
                );
                
                // Add to existing images
                currentImageUrls = [...currentImageUrls, response.file_path];
                onUploadSuccess?.(response);
            }
            
            if (files.length > remainingSlots) {
                uploadError = `Only ${filesToUpload} of ${files.length} images were uploaded due to the maximum limit of ${maxImages} images.`;
            }
        } catch (error) {
            console.error("Upload failed:", error);
            uploadError = "Failed to upload image";
            onUploadError?.(error instanceof Error ? error.message : String(error));
        } finally {
            isUploading = false;
        }
    }
    
    function removeImage(index: number) {
        currentImageUrls = currentImageUrls.filter((_, i) => i !== index);
    }
    
    function getFullImageUrl(url: string) {
        return url.startsWith("http") || url.startsWith("www")
            ? url
            : API_BASE_URL + url;
    }
    
    // Determine grid columns class based on prop
    $derived columnClass = {
        2: "grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
    }[columns];
</script>

<div class="w-full space-y-4">
    <!-- Image Grid -->
    {#if currentImageUrls.length > 0}
        <div class={`grid ${columnClass} gap-4`}>
            {#each currentImageUrls as url, index}
                <div
                    class="relative aspect-square rounded-md overflow-hidden border bg-muted"
                >
                    <img
                        src={getFullImageUrl(url)}
                        alt={`${altText} ${index + 1}`}
                        class="w-full h-full object-cover"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        class="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onclick={() => removeImage(index)}
                    >
                        <X class="h-3 w-3" />
                    </Button>
                </div>
            {/each}

            {#if currentImageUrls.length < maxImages}
                <!-- Add Image Placeholder -->
                <div
                    class="relative aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                    onclick={() =>
                        document.getElementById("grid-file-upload")?.click()}
                >
                    <div
                        class="flex flex-col items-center gap-2 text-muted-foreground"
                    >
                        <Image class="h-8 w-8" />
                        <span class="text-xs font-medium">Add Image</span>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Empty State -->
        <div
            class="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center cursor-pointer hover:bg-muted/10 transition-colors"
            onclick={() => document.getElementById("grid-file-upload")?.click()}
        >
            <div class="flex flex-col items-center justify-center space-y-2">
                <Upload class="h-8 w-8 text-muted-foreground" />
                <p class="text-sm text-muted-foreground font-medium">
                    Upload images
                </p>
                <p class="text-xs text-muted-foreground">
                    Click to browse or drag and drop
                </p>
            </div>
        </div>
    {/if}

    <!-- Upload Button -->
    <div class="flex justify-between items-center">
        <input
            type="file"
            id="grid-file-upload"
            accept="image/*"
            multiple
            class="hidden"
            onchange={(e) => {
                const files = e.currentTarget.files;
                if (files && files.length > 0) {
                    handleFileUpload(files);
                }
            }}
        />
        <Button
            variant="outline"
            class="gap-2"
            onclick={() => {
                document.getElementById("grid-file-upload")?.click();
            }}
            disabled={isUploading || currentImageUrls.length >= maxImages}
        >
            <Upload class="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Images"}
        </Button>

        {#if currentImageUrls.length > 0}
            <p class="text-sm text-muted-foreground">
                {currentImageUrls.length} of {maxImages} images
            </p>
        {/if}
    </div>

    <!-- Error Message -->
    {#if uploadError}
        <div class="text-sm text-destructive">
            {uploadError}
        </div>
    {/if}
</div>
