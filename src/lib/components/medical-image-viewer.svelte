<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { type UploadTestAssetResponse } from "$lib/services/testAssetService";
    import { API_BASE_URL } from "$lib/config/api";
    import MedicalImageUploader from "./medical-image-uploader.svelte";

    const {
        imageUrls: initialImageUrls = [],
        altText,
        caption = undefined,
        subtitle = undefined,
        caseId,
        testName,
        testType,
        onUploadSuccess,
        onUploadError,
    } = $props<{
        imageUrls: string[];
        altText: string;
        caption?: string;
        subtitle?: string;
        caseId: string;
        testName: string;
        testType: "physical_exam" | "lab_test";
        onUploadSuccess?: (response: UploadTestAssetResponse) => void;
        onUploadError?: (error: string) => void;
    }>();

    // Initialize with the initial image URLs if provided
    let imageUrls = $state<string[]>(initialImageUrls);
    let currentImageUrl = $state(
        initialImageUrls.length > 0 ? initialImageUrls[0] : "",
    );
    let selectedImageIndex = $state(0);
    let isUploading = $state(false);
    let uploadError = $state<string | null>(null);
    let viewerDialogOpen = $state(false);

    // Initialize imageError after imageUrls is defined
    let imageError = $state(initialImageUrls.length === 0);
    // Log when imageUrls changes
    $effect(() => {
        console.log("Image URLs updated:", imageUrls);
    });
    function getFullImageUrl(url: string) {
        if (!url) return "";
        return url.startsWith("http") || url.startsWith("www")
            ? url
            : API_BASE_URL + url;
    }

    function handleImageError(index: number) {
        console.warn(`Image at index ${index} failed to load`);
        // Only set imageError to true if all images fail to load
        if (imageUrls.length === 1) {
            imageError = true;
        } else {
            // Remove the failed image from the array
            imageUrls = imageUrls.filter((_, i) => i !== index);
            if (imageUrls.length === 0) {
                imageError = true;
            } else if (selectedImageIndex === index) {
                // If the current image failed, select the first available one
                selectedImageIndex = 0;
                currentImageUrl = imageUrls[0];
            }
        }
    }

    function handleUploadSuccess(response: UploadTestAssetResponse) {
        console.log("Upload success response:", response);

        if (
            response.image_urls &&
            Array.isArray(response.image_urls) &&
            response.image_urls.length > 0
        ) {
            // Handle multiple images response
            imageUrls = response.image_urls;
            currentImageUrl = response.image_urls[0];
            selectedImageIndex = 0;
            imageError = false;
        } else if (response.file_path) {
            // Handle single image response (fallback)
            imageUrls = [response.file_path];
            currentImageUrl = response.file_path;
            selectedImageIndex = 0;
            imageError = false;
        } else {
            console.error("Invalid response format:", response);
            imageError = true;
        }

        onUploadSuccess?.(response);
        isUploading = false;
    }

    function handleUploadError(error: any) {
        uploadError = error;
        onUploadError?.(error);
        isUploading = false;
    }

    function handleUploadStart() {
        isUploading = true;
        uploadError = null;
    }

    function selectImage(index: number) {
        selectedImageIndex = index;
        currentImageUrl = imageUrls[index];
        viewerDialogOpen = true;
    }
</script>

{#if !imageError && imageUrls.length > 0}
    <!-- Image Gallery Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each imageUrls as imageUrl, index}
            <div
                class="relative overflow-hidden rounded-md cursor-pointer aspect-square"
                onclick={() => selectImage(index)}
                onkeydown={(e) => e.key === "Enter" && selectImage(index)}
                tabindex="0"
                role="button"
                aria-label={`View image ${index + 1}`}
            >
                <img
                    src={getFullImageUrl(imageUrl)}
                    alt={`${altText} ${index + 1}`}
                    class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
                    onerror={() => handleImageError(index)}
                />
            </div>
        {/each}
    </div>

    <!-- Caption and Timestamp -->
    {#if caption || subtitle}
        <div class="flex flex-col flex-start mt-2">
            {#if caption}
                <p class="text-sm font-semibold text-muted-foreground">
                    {caption}
                </p>
            {/if}
        </div>
    {/if}
{:else}
    <MedicalImageUploader
        {caseId}
        {testName}
        {testType}
        onStart={handleUploadStart}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
    />
{/if}

<!-- Image Viewer Dialog -->
<Dialog.Root bind:open={viewerDialogOpen}>
    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            {#if caption}
                <Dialog.Title>{caption}</Dialog.Title>
                <Dialog.Description
                    >{#if subtitle}
                        <p class="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    {/if}</Dialog.Description
                >
            {/if}
        </Dialog.Header>

        <div
            class="relative w-full overflow-auto h-fit max-h-[calc(90vh-150px)] rounded-lg"
        >
            <img
                src={getFullImageUrl(currentImageUrl)}
                alt={`${altText} ${selectedImageIndex + 1}`}
                class="w-full h-auto object-contain"
            />
        </div>

        {#if imageUrls.length > 1}
            <div class="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
                {#each imageUrls as url, index}
                    <button
                        class="w-16 h-16 rounded-md overflow-hidden border-2 transition-all {index ===
                        selectedImageIndex
                            ? 'border-primary'
                            : 'border-transparent'}"
                        onclick={() => {
                            selectedImageIndex = index;
                            currentImageUrl = url;
                        }}
                    >
                        <img
                            src={getFullImageUrl(url)}
                            alt={`Thumbnail ${index + 1}`}
                            class="w-full h-full object-cover"
                        />
                    </button>
                {/each}
            </div>
        {/if}

        <Dialog.Footer class="flex justify-between items-center">
            <div class="flex gap-2">
                {#if selectedImageIndex > 0}
                    <Button
                        variant="outline"
                        onclick={() => {
                            selectedImageIndex--;
                            currentImageUrl = imageUrls[selectedImageIndex];
                        }}
                    >
                        Previous
                    </Button>
                {/if}

                {#if selectedImageIndex < imageUrls.length - 1}
                    <Button
                        variant="outline"
                        onclick={() => {
                            selectedImageIndex++;
                            currentImageUrl = imageUrls[selectedImageIndex];
                        }}
                    >
                        Next
                    </Button>
                {/if}
            </div>

            <Dialog.Close>
                <Button variant="outline">Close</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Show upload status -->
{#if isUploading}
    <div class="text-sm text-muted-foreground">Uploading...</div>
{/if}

{#if uploadError}
    <div class="text-sm text-destructive">
        {uploadError}
    </div>
{/if}
