<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Upload, Search } from "lucide-svelte";
    import {
        testAssetService,
        type UploadTestAssetResponse,
    } from "$lib/services/testAssetService";
    import { API_BASE_URL } from "$lib/config/api";
    import { searchMedicalImages } from "$lib/stores/caseCreatorStore";
    import type { ImageSearchResponse } from "$lib/services/imageSearchService";
    import { lastCaseIdStore } from "$lib/stores/caseCreatorStore";
    import { get } from "svelte/store";
    const {
        imageUrl: initialImageUrl,
        altText,
        caption = undefined,
        subtitle = undefined,
        caseId,
        testName,
        testType,
        onUploadSuccess,
        onUploadError,
    } = $props<{
        imageUrl: string;
        altText: string;
        caption?: string;
        subtitle?: string;
        caseId: string;
        testName: string;
        testType: "physical_exam" | "lab_test";
        onUploadSuccess?: (response: UploadTestAssetResponse) => void;
        onUploadError?: (error: string) => void;
    }>();

    let currentImageUrl = $state(initialImageUrl);
    let imageError = $state(false);
    let isUploading = $state(false);
    let uploadError = $state<string | null>(null);
    let searchDialogOpen = $state(false);
    let searchQuery = $state("");
    let searchResults = $state<ImageSearchResponse | null>(null);
    let isSearching = $state(false);
    let searchError = $state<string | null>(null);

    async function handleSearch() {
        if (!searchQuery.trim()) return;

        try {
            isSearching = true;
            searchError = null;
            const results = await searchMedicalImages(searchQuery);
            searchResults = results ?? null;
        } catch (error) {
            searchError =
                error instanceof Error ? error.message : "Search failed";
        } finally {
            isSearching = false;
        }
    }

    async function selectAndUploadImage(imageUrl: string) {
        searchDialogOpen = false;
        await uploadImageFromUrl(imageUrl);
    }

    function handleImageError() {
        imageError = true;
    }

    async function handleFileUpload(file: File) {
        try {
            isUploading = true;
            uploadError = null;
            debugger;
            const response = await testAssetService.uploadTestAsset(
                file,
                caseId,
                testName,
                testType,
            );
            debugger;
            console.log(response);
            onUploadSuccess?.(response);
            currentImageUrl = response.file_path;
            if (currentImageUrl) {
                imageError = false;
            }
            debugger;
        } catch (error) {
            console.error("Upload failed:", error);
            uploadError = "Failed to upload image";
            onUploadError?.(error);
            isUploading = false;
        } finally {
            isUploading = false;
        }
    }

    async function uploadImageFromUrl(imageUrl: string) {
        try {
            isUploading = true;
            uploadError = null;
            
            const response = await testAssetService.uploadTestAssetFromUrl({
                case_id: caseId,
                test_name: testName,
                test_type: testType,
                image_url: imageUrl,
            });

            currentImageUrl = response.file_path;
            imageError = false;

            if (onUploadSuccess) {
                onUploadSuccess(response);
            }
        } catch (error) {
            console.error("URL upload failed:", error);
            uploadError = "Failed to upload image from URL";
            onUploadError?.(error);
        } finally {
            isUploading = false;
        }
    }
</script>

<Dialog.Root>
    {#if !imageError}
        <Dialog.Trigger class="w-full text-left border-none">
            <div class="group space-y-1.5">
                <div class="relative overflow-hidden rounded-md">
                    <div class="relative w-full h-full">
                        <!-- sometimes the image url is     
                         not a full url(when the image is 
                         from the actual server and not 
                         from the our server, so we need to
                          add the base url -->
                          {@debug currentImageUrl}
                        <img
                            src={currentImageUrl.startsWith("http") ||
                            currentImageUrl.startsWith("www")
                                ? currentImageUrl
                                : API_BASE_URL + currentImageUrl}
                            alt={altText}
                            class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02] cursor-zoom-in"
                            onerror={handleImageError}
                        />
                    </div>
                </div>
            </div>
        </Dialog.Trigger>
    {:else}
        <div
            class="w-full h-full min-h-[200px] flex items-center justify-start bg-muted rounded-md"
        >
            <div class="w-full space-y-4 p-4 border rounded-md">
                <h3 class="text-lg font-medium mb-4">Add Image</h3>

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
                            class="hidden"
                            onchange={(e) => {
                                const file = e.currentTarget.files?.[0];
                                if (file) {
                                    handleFileUpload(file);
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
                            Choose File
                        </Button>
                    </div>
                </div>

                <!-- URL Input Option -->
                <div class="space-y-2">
                    <label for="image-url" class="block text-sm font-medium">
                        Enter image URL
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="url"
                            id="image-url"
                            placeholder="Enter a link to an image to add"
                            class="flex-1 px-3 py-2 border rounded-md"
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
                    </div>
                </div>

                <!-- Search Images Button -->
                <div class="space-y-2">
                    <Button
                        variant="outline"
                        class="gap-2 w-full"
                        onclick={() => (searchDialogOpen = true)}
                    >
                        <Search class="h-4 w-4" />
                        Search Medical Images
                    </Button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Caption and Timestamp -->
    {#if caption || subtitle}
        <div class=" flex flex-col flex-start">
            {#if caption}
                <p class="text-sm font-semibold text-muted-foreground">
                    {caption}
                </p>
            {/if}
        </div>
    {/if}

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
                src={currentImageUrl.startsWith("http") ||
                currentImageUrl.startsWith("www")
                    ? currentImageUrl
                    : API_BASE_URL + currentImageUrl}
                alt={altText}
                class="w-full h-auto object-cover"
            />
        </div>

        <Dialog.Footer class="flex justify-start items-start">
            <Dialog.Close>
                <Button variant="outline">Close</Button>
            </Dialog.Close>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!-- Image Search Dialog -->
<Dialog.Root bind:open={searchDialogOpen}>
    <Dialog.Content class="sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>Search Medical Images</Dialog.Title>
            <Dialog.Description>
                Search for relevant medical images to add to your case.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter search terms..."
                    class="flex-1 px-3 py-2 border rounded-md"
                    bind:value={searchQuery}
                    onkeydown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                    variant="default"
                    onclick={handleSearch}
                    disabled={isSearching}
                >
                    {#if isSearching}
                        <span class="animate-spin mr-2">⌛</span>
                    {/if}
                    Search
                </Button>
            </div>

            {#if searchError}
                <p class="text-sm text-destructive">{searchError}</p>
            {/if}

            {#if searchResults}
                <div
                    class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto"
                >
                    {#each searchResults.images as image}
                        <div class="border rounded-md p-2 space-y-2">
                            <img
                                src={image.url}
                                alt={image.title}
                                class="w-full h-48 object-cover rounded-md"
                            />
                            <p class="text-sm font-medium truncate">
                                {image.title}
                            </p>
                            <p class="text-xs text-muted-foreground truncate">
                                Source: {image.source}
                            </p>
                            <Button
                                variant="outline"
                                class="w-full"
                                onclick={() => selectAndUploadImage(image.url)}
                            >
                                Select Image
                            </Button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <Dialog.Footer>
            <Dialog.Close>
                <Button variant="outline">Cancel</Button>
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
