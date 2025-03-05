<script lang="ts">
    import { casesListStore } from "$lib/stores/casePlayerStore";
    import { currentTeam } from "$lib/stores/teamStore";
    import { onMount } from "svelte";
    import { fetchCases } from "$lib/stores/casePlayerStore";
    import { API_BASE_URL } from "$lib/config/api";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import PageLayout from "../04-templates/page-layout.svelte";

    interface Case {
        case_id: number;
        title: string;
        quote: string;
        image_url: string;
        last_updated?: string;
    }

    let cases: Case[] = [];

    onMount(async () => {
        await fetchCases();
        cases = $casesListStore || [];
    });

    $: filteredCases = cases.length
        ? $currentTeam?.name === "Dermatology"
            ? cases.filter((c) => {
                  const id = Number(c.case_id);
                  return id >= 1 && id <= 5;
              })
            : $currentTeam?.name === "Internal Medicine"
              ? cases.filter((c) => {
                    const id = Number(c.case_id);
                    return id >= 6 && id <= 10;
                })
              : cases
        : [];
</script>

<PageLayout
    title="Case Library"
    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Library" }]}
>
    <h1 class="text-3xl font-bold mb-6">Case Library</h1>
    <p class="text-gray-500 mb-8">
        A collection of cases for you to learn from.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each filteredCases as caseItem}
            <a href={`/case-library/${caseItem.case_id}`} class="group">
                <div
                    class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                    <div class="relative aspect-square">
                        <img
                            src={API_BASE_URL + caseItem.image_url ||
                                "/placeholder-image.jpg"}
                            alt={caseItem.title}
                            class="object-cover absolute inset-0 w-full h-full"
                        />
                    </div>
                    <div class="p-4">
                        <h3
                            class="font-semibold text-lg group-hover:text-blue-600 transition-colors"
                        >
                            {caseItem.title || "Untitled Case"}
                        </h3>
                        <p class="text-gray-600 text-sm mt-1 line-clamp-2">
                            {caseItem.quote || "No description available"}
                        </p>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</PageLayout>

<style>
</style>
