<script lang="ts">
    import { X } from "lucide-svelte";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";

    const { feedback } = $props<{
        feedback: {
            communication: string;
            empathy_patient_centeredness: string;
            professionalism_ethics: string;
            information_gathering: string;
        };
    }>();

    const feedbackCategories = [
        {
            title: "Communication",
            icon: "💬",
            content: feedback.communication,
            bgColor: "bg-blue-50",
        },
        {
            title: "Empathy & Patient-Centeredness",
            icon: "❤️",
            content: feedback.empathy_patient_centeredness,
            bgColor: "bg-red-50",
        },
        {
            title: "Professionalism & Ethics",
            icon: "🤝",
            content: feedback.professionalism_ethics,
            bgColor: "bg-purple-50",
        },
        {
            title: "Information Gathering",
            icon: "📝",
            content: feedback.information_gathering,
            bgColor: "bg-green-50",
        },
    ];
</script>

<Popover.Root>
    <Popover.Trigger>
        <Button
            variant="link"
            class="text-sm p-0 h-0 text-blue-800 hover:underline"
        >
            View detailed feedback
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[36rem] p-0 shadow-lg border-0">
        <div class="bg-white rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="p-4 border-b bg-blue-50">
                <div class="flex justify-between items-center">
                    <h3 class="font-medium text-lg">
                        AETCOM Feedback Analysis
                    </h3>
                    <Popover.Close class="text-gray-500 hover:text-gray-700">
                        <X class="h-4 w-4" />
                    </Popover.Close>
                </div>
            </div>

            <!-- Main content -->
            <div class="p-4 space-y-3">
                {#each feedbackCategories as category}
                    <div class="p-3 rounded-md {category.bgColor}">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xl">{category.icon}</span>
                            <h4 class="font-medium">{category.title}</h4>
                        </div>

                        <!-- Split the content into Observation and Action -->
                        {#if category.content.includes("Action:")}
                            {@const [observation, action] =
                                category.content.split("Action:")}
                            <div class="space-y-2">
                                <p class="text-sm text-gray-700">
                                    {observation}
                                </p>
                                <div class="bg-white/50 p-2 rounded">
                                    <p class="text-sm">
                                        <span class="font-medium"
                                            >Action:
                                        </span>
                                        {action}
                                    </p>
                                </div>
                            </div>
                        {:else}
                            <p class="text-sm text-gray-700">
                                {category.content}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </Popover.Content>
</Popover.Root>
