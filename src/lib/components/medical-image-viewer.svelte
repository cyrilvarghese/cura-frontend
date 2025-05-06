<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { type UploadTestAssetResponse } from "$lib/services/testAssetService";
    import { API_BASE_URL } from "$lib/config/api";
    import MedicalImageUploader from "./medical-image-uploader.svelte";
    import { X, ChevronLeft, ChevronRight } from "lucide-svelte";
    import { testAssetService } from "$lib/services/testAssetService";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { getContext } from "svelte";
    import { authStore, type AuthState } from "$lib/stores/authStore";
    import { editPhysicalExamTableStore } from "$lib/stores/editTablePEStore";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    const caseType = getContext<"new" | "edit">("case-type"); // new or edit mode
    let user: AuthState["user"] | undefined = $state();

    async function handleNoImagesAvailable() {
        // Your function logic here
        console.log("No images available for this test");
        const success = await editPhysicalExamTableStore.addComment(
            caseId,
            testName,
            testType,
            "Student: No images available for this test",
        );
        return null; // Return value is optional
    }
    authStore.subscribe((state) => {
        user = state.user;
        if (user) {
            console.log("Current user role:", user.role);
        }
    });
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
    let isDeleting = $state(false);
    let uploadError = $state<string | null>(null);
    let viewerDialogOpen = $state(false);
    let deleteConfirmOpen = $state(false);

    // Check for example.com URLs on initialization
    let imageError = $state(
        initialImageUrls.some((url: string) => url.includes("example.com")) ||
            initialImageUrls.length === 0,
    );

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

    function openDeleteConfirm() {
        deleteConfirmOpen = true;
    }

    async function confirmDelete() {
        try {
            isDeleting = true;
            deleteConfirmOpen = false;

            // Call the delete endpoint
            const response = await testAssetService.deleteTestAsset(
                caseId,
                testType,
                testName,
            );

            console.log("Delete response:", response);

            // Clear the image URLs after successful deletion
            imageUrls = [];
            imageError = true;
        } catch (error) {
            console.error("Failed to delete images:", error);
            uploadError = "Failed to delete images";
        } finally {
            isDeleting = false;
        }
    }
</script>

<!-- Loading Overlays -->
<LoadingOverlay isVisible={isUploading} message="Uploading images..." />
<LoadingOverlay isVisible={isDeleting} message="Deleting images..." />

{#if !imageError && imageUrls.length > 0}
    <!-- Image Gallery with Delete All button -->
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Images for {testName}</h3>
            {#if user?.role === "admin"}
                <button
                    class="text-xs text-destructive hover:underline flex items-center gap-1"
                    onclick={openDeleteConfirm}
                    aria-label="Delete all images"
                >
                    <X class="h-3 w-3" />
                    Delete All Images
                </button>
            {/if}
        </div>

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
                        alt="test"
                        class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.05]"
                        onerror={() => handleImageError(index)}
                    />
                </div>
            {/each}
        </div>
        <!-- Caption and Timestamp -->
        {#if caption || subtitle || altText}
            <div class="flex flex-col flex-start mt-2">
                <!-- {#if caption}
                    <p class="text-sm font-semibold text-muted-foreground">
                        {caption}
                    </p>
                {/if} -->
                <!-- <p class="text-sm font-semibold text-muted-foreground">
                    {altText}
                </p> -->
            </div>
        {/if}
        <!-- Add uploader for additional images -->
        <div class="mt-4 pt-4">
            <MedicalImageUploader
                {caseId}
                {testName}
                {testType}
                onStart={handleUploadStart}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
                showHeader={false}
            />
        </div>
    </div>
{:else if user?.role !== "student"}
    <MedicalImageUploader
        {caseId}
        {testName}
        {testType}
        onStart={handleUploadStart}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
    />
{:else}
    {@const _ = handleNoImagesAvailable()}
    <div class="text-sm text-muted-foreground">
        Images are not available for this test.
    </div>
{/if}

<!-- Image Viewer Dialog -->
<Dialog.Root bind:open={viewerDialogOpen}>
    <Dialog.Content class="max-w-4xl">
        <Dialog.Header>
            {#if altText}
                <!-- <Dialog.Title>{altText}</Dialog.Title> -->
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
                alt="test"
                src={getFullImageUrl(currentImageUrl)}
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
            <div class="flex gap-2 pr-8">
                <Button
                    disabled={selectedImageIndex <= 0}
                    variant="outline"
                    size="icon"
                    class="bg-blue-500 text-white"
                    onclick={() => {
                        selectedImageIndex--;
                        currentImageUrl = imageUrls[selectedImageIndex];
                    }}
                    aria-label="Previous image"
                >
                    <ChevronLeft class="h-4 w-4 " />
                </Button>

                <Button
                    disabled={selectedImageIndex >= imageUrls.length - 1}
                    variant="outline"
                    size="icon"
                    class="bg-blue-500 text-white"
                    onclick={() => {
                        selectedImageIndex++;
                        currentImageUrl = imageUrls[selectedImageIndex];
                    }}
                    aria-label="Next image"
                >
                    <ChevronRight class="h-4 w-4" />
                </Button>
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

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteConfirmOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete all images?</AlertDialog.Title>
            <AlertDialog.Description>
                This will remove all images from this test. This action cannot
                be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action class="bg-destructive" onclick={confirmDelete}>
                Delete
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
