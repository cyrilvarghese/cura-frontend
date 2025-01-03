<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { API_BASE_URL } from "$lib/config/api";
    import { patientFile } from "$lib/stores/apiStore";
    import type { ImageData, PatientFileItem } from "$lib/types";
    
    //local state
    type PatientFiles = {
        name: string;
        caption: string;
        url: string;
        aspect: string;
    };

    const initialFiles: PatientFiles[] = [
 
    ];

    function convertImageDataToPatientFile(
        name: string,
        imageData: ImageData,
    ): PatientFiles {
        return {
            name,
            caption: imageData.caption || imageData.altText,
            url: imageData.url,
            aspect: "16/9",
        };
    }

    function scrollToLatest() {
        requestAnimationFrame(() => {
            const bottomAnchor = document.querySelector("#bottom-anchor");
            if (bottomAnchor) {
                bottomAnchor.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        });
    }

    const allFiles = $derived([
        ...initialFiles,
        ...$patientFile.flatMap((file: PatientFileItem) => {
            if (file.result.type === "mixed") {
                return file.result.content
                    .filter((item) => item.type === "image")
                    .map((item) =>
                        convertImageDataToPatientFile(
                            file.name,
                            item.content as ImageData,
                        ),
                    );
            } else if (file.result.type === "image") {
                return [
                    convertImageDataToPatientFile(
                        file.name,
                        file.result.content as ImageData,
                    ),
                ];
            }
            return [];
        }),
    ]);

    $effect(() => {
        if ($patientFile?.length) {
            scrollToLatest();
        }
    });
</script>

<div class="flex-col w-full p-6 h-full">
    <h2 class="text-lg font-semibold pb-8 border-b border-gray-200">Patient File</h2>
    <ScrollArea
        class="w-full h-[calc(100%-100px)] rounded-md "
        orientation="vertical"
    >
        <div id="patient-files-container" class="pt-8">
            {#each allFiles as file (file.url)}
                <h3 class="text-sm font-semibold pb-2 text-muted-foreground">{file.name}</h3>
                <figure class="shrink-0 pb-10">
                    <div
                        class="overflow-hidden flex justify-start items-center rounded-md"
                    >
                        <img
                            src={API_BASE_URL + file.url}
                            alt={file.caption}
                            class="aspect-[16/9] rounded-md h-fit w-fit object-cover"
                            width={300}
                            height={400}
                        />
                    </div>
                    <figcaption class="mt-4 space-y-1">
                        <p class="text-sm leading-snug text-muted-foreground">
                            {file.caption}
                        </p>
                    </figcaption>
                </figure>
            {/each}
            <!-- Taller placeholder element for better scrolling -->
            <div id="bottom-anchor" class="h-[10px]" aria-hidden="true"></div>
        </div>
    </ScrollArea>
</div>
