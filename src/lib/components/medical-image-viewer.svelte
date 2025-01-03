<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Upload } from "lucide-svelte";
    import { testAssetService, type UploadTestAssetResponse } from '$lib/services/testAssetService';
    import { API_BASE_URL } from "$lib/config/api";
    const {
        imageUrl: initialImageUrl,
        altText,
        caption = undefined,
        subtitle = undefined,
        caseId,
        testName,
        testType,
        onUploadSuccess
    } = $props<{
        imageUrl: string;
        altText: string;
        caption?: string;
        subtitle?: string;
        caseId: string;
        testName: string;
        testType: 'physical_exam' | 'lab_test';
        onUploadSuccess?: (response: UploadTestAssetResponse) => void;
    }>();

    let currentImageUrl = $state(initialImageUrl);
    let imageError = $state(false);
    let isUploading = $state(false);
    let uploadError = $state<string | null>(null);

    function handleImageError() {
        imageError = true;
    }

    async function handleFileUpload(file: File) {
        try {
            isUploading = true;
            uploadError = null;
            debugger
            
            const response = await testAssetService.uploadTestAsset(
                file,
                caseId,
                testName,
                testType
            );
            debugger
            console.log(response);
            onUploadSuccess?.(response);
            currentImageUrl = response.file_path;
            if (currentImageUrl) {
                imageError = false;
            }
            debugger
        } catch (error) {
            console.error('Upload failed:', error);
            uploadError = 'Failed to upload image';
            isUploading = false;    
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
                        <img
                            src={API_BASE_URL + currentImageUrl}
                            alt={altText}
                            class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02] cursor-zoom-in"
                            onerror={handleImageError}
                        />
                    </div>
                </div>
            </div>
        </Dialog.Trigger>
    {:else}
        <div class="w-full h-full min-h-[200px] flex items-center justify-start bg-muted rounded-md">
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
                                document.getElementById('file-upload')?.click();
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
                                const url = (document.getElementById('image-url') as HTMLInputElement)?.value;
                                if (url) {
                                    console.log('URL entered:', url);
                                    // Add your URL handling logic here
                                }
                            }}
                        >
                            Add
                        </Button>
                    </div>
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
                src={API_BASE_URL + currentImageUrl}
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

<!-- Show upload status -->
{#if isUploading}
    <div class="text-sm text-muted-foreground">
        Uploading...
    </div>
{/if}

{#if uploadError}
    <div class="text-sm text-destructive">
        {uploadError}
    </div>
{/if}
