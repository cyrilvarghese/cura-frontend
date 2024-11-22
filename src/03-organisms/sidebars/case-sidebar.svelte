<script lang="ts">
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    type PatientFiles = {
        caption: string;
        url: string;
        aspect: string;
    };

    const works: PatientFiles[] = [
        {
            caption: "The patient presenting at the clinic, showing visible concern about her rash.",
            url: "https://cdn.midjourney.com/6703f338-5798-4ef4-bc15-865900f67df2/0_3.png",
            aspect: "16/9"
        },
        {
            caption: "Close-up of the rash during its active stage, showing red, raised patches typical of urticarial vasculitis",
            url: "https://www.pcds.org.uk/imager/gallery/clinical/urticarial-vasculitis/13305/urt_vascul_33_fee391183f15cb4d62773032fe0be92d.jpg",
            aspect: "16/9"
        },
        {
            caption: "Post-lesional bruising where the rash has faded, characteristic of urticarial vasculitis.",
            url: "https://www.emjreviews.com/wp-content/uploads/2020/12/Chronic-Urticaria.jpg",
            aspect: "16/9"
        },
    ];
</script>

<ScrollArea
    class="w-96 h-full rounded-md border"
    orientation="vertical"
>
    <div class="flex-col w-full p-4">
        <h2 class="text-lg font-semibold pb-8">Patient Files</h2>
        {#each works as file (file.url)}
            <figure class="shrink-0 pb-10">
                <div
                    class="overflow-hidden flex justify-center items-center rounded-md"
                >
                    <img
                        src={file.url}
                        alt={`Photo by ${file.caption}`}
                        class="aspect-[16/9] rounded-md h-fit w-fit object-cover"
                        width={300}
                        height={400}
                    /> 
                </div>
                <figcaption
                    class="mt-4 space-y-1"
                >
                    <p class="text-sm leading-snug text-foreground">
                        {file.caption}
                    </p>
                    <p class="text-xs text-muted-foreground">
                        Patient Documentation Image
                    </p>
                </figcaption>
            </figure>
        {/each}
    </div>
</ScrollArea>
