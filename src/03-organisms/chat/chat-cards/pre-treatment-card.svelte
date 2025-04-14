<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import ClipboardList from "lucide-svelte/icons/clipboard-list";
    import CheckSquare from "lucide-svelte/icons/check-square";
    import Microscope from "lucide-svelte/icons/microscope";
    import LineChart from "lucide-svelte/icons/line-chart";

    type PreTreatmentData = {
        preTreatmentInvestigations: string[];
        postTreatmentMonitoring: string[];
    };

    export let pretreatment: PreTreatmentData;
</script>

<Card.Root
    class="w-[350px] max-w-2xl border-l-4 border-l-blue-900/50 rounded-none rounded-r-md shadow-sm bg-white"
>
    <Card.Header>
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <Microscope class="h-6 w-6 text-gray-900/70" />
                <Card.Title class="text-gray-600"
                    >Investigations and Monitoring</Card.Title
                >
            </div>
        </div>
    </Card.Header>

    <Card.Content>
        <div class="space-y-6">
            <!-- Pre-treatment Section -->
            <div class="space-y-3">
                <Badge
                    variant="outline"
                    class="bg-indigo-50/50 text-indigo-800 hover:bg-indigo-50/80 border-indigo-200 flex items-center gap-1"
                >
                    <ClipboardList class="h-3 w-3" />
                    Pre-treatment Investigations
                </Badge>
                <ul class="space-y-2 pl-1">
                    {#each pretreatment.preTreatmentInvestigations as investigation}
                        <li class="flex items-start gap-2">
                            <div
                                class="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center"
                            >
                                <CheckSquare
                                    class="h-3 w-3 text-indigo-900/70"
                                />
                            </div>
                            <span
                                class="text-sm text-indigo-800 leading-relaxed"
                                >{investigation}</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- Post-treatment Section -->
            <div class="space-y-3">
                <Badge
                    variant="outline"
                    class="bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50/80 border-emerald-200 flex items-center gap-1"
                >
                    <LineChart class="h-3 w-3" />
                    Post-treatment Monitoring
                </Badge>
                <ul class="space-y-2 pl-1">
                    {#each pretreatment.postTreatmentMonitoring as monitoring}
                        <li class="flex items-start gap-2">
                            <div
                                class="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center"
                            >
                                <CheckSquare
                                    class="h-3 w-3 text-emerald-900/70"
                                />
                            </div>
                            <span
                                class="text-sm text-emerald-800 leading-relaxed"
                                >{monitoring}</span
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </Card.Content>
</Card.Root>
