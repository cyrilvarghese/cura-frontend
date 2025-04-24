<script lang="ts">
    import { casesListStore } from "$lib/stores/casePlayerStore";
    import { currentDepartment } from "$lib/stores/teamStore";
    import { onMount } from "svelte";
    import { fetchCases } from "$lib/stores/casePlayerStore";
    import { API_BASE_URL } from "$lib/config/api";
    import PageLayout from "../04-templates/page-layout.svelte";
    import { Link } from "svelte-routing";
    import * as Tabs from "$lib/components/ui/tabs";
    import { FileCheck, Pencil } from "lucide-svelte";
    import type { CaseListItem } from "$lib/services/caseDataService";
    import { authStore } from "$lib/stores/authStore";
    import type { AuthState } from "$lib/stores/authStore";
    let cases: CaseListItem[] = $state([]);
    let searchQuery = $state("");
    let activeTab = $state("drafts");
    let user: AuthState["user"] | undefined = $state();
    authStore.subscribe((state) => {
        user = state.user;
        if (user) {
            console.log("Current user role:", user.role);
        }
    });
    onMount(async () => {
        await fetchCases();
        cases = $casesListStore || [];
    });

    //filter cases based on department and published status
    let filteredCases = $derived(
        cases.length
            ? cases.filter(
                  (c) =>
                      $currentDepartment?.name === c.department &&
                      (activeTab === "published"
                          ? c.published
                          : !c.published) &&
                      !c.deleted &&
                      (!searchQuery ||
                          c.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                          c.quote
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())),
              )
            : [],
    );
</script>

<PageLayout
    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Library" }]}
>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Case Library</h1>
        <div class="relative">
            <input
                type="search"
                placeholder="Search..."
                bind:value={searchQuery}
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    <p class="text-gray-500 mb-8">
        A collection of cases for you to learn from.
    </p>

    <Tabs.Root
        value={activeTab}
        class="mb-8"
        onValueChange={(value) => (activeTab = value)}
    >
        {#if user?.role === "admin"}
            <Tabs.List class="mb-4">
                <Tabs.Trigger value="published">Published Cases</Tabs.Trigger>
                <Tabs.Trigger value="drafts">Drafts</Tabs.Trigger>
            </Tabs.List>
        {/if}
        <hr class="border-gray-200" />

        <div class="mt-6">
            <Tabs.Content
                value="published"
                class="animate-in fade-in duration-500"
            >
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {#each filteredCases as caseItem}
                        <div class="animate-in fade-in duration-500">
                            <Link
                                to={`/case-library/${caseItem.case_id}`}
                                class="group"
                            >
                                <div
                                    class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div class="relative aspect-square">
                                        <img
                                            src={API_BASE_URL +
                                                caseItem.image_url ||
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
                                        <p
                                            class="text-gray-600 text-sm mt-1 line-clamp-2"
                                        >
                                            {caseItem.quote ||
                                                "No description available"}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    {/each}
                </div>
            </Tabs.Content>

            <Tabs.Content
                value="drafts"
                class="animate-in fade-in duration-500"
            >
                {#if filteredCases.length === 0}
                    <div class="col-span-full text-center py-16">
                        <FileCheck
                            class="w-12 h-12 text-gray-400 mx-auto mb-3"
                        />
                        <p class="text-gray-500 text-lg">
                            All cases are currently published.
                        </p>
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {#each filteredCases as caseItem}
                            <div class="animate-in fade-in duration-500">
                                <div
                                    class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                                >
                                    <Link
                                        to={`/case-library/${caseItem.case_id}`}
                                        class="group"
                                    >
                                        <div class="relative aspect-square">
                                            <img
                                                src={API_BASE_URL +
                                                    caseItem.image_url ||
                                                    "/placeholder-image.jpg"}
                                                alt={caseItem.title}
                                                class="object-cover absolute inset-0 w-full h-full"
                                            />
                                        </div>
                                        <div class="p-4">
                                            <h3
                                                class="font-semibold text-lg group-hover:text-blue-600 transition-colors"
                                            >
                                                {caseItem.title ||
                                                    "Untitled Case"}
                                            </h3>
                                            <p
                                                class="text-gray-600 text-sm mt-1 line-clamp-2"
                                            >
                                                {caseItem.quote ||
                                                    "No description available"}
                                            </p>
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/case-library/edit?caseId=${caseItem.case_id}`}
                                        class="absolute bottom-2 right-2 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <Pencil class="w-4 h-4 text-blue-500" />
                                    </Link>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </Tabs.Content>
        </div>
    </Tabs.Root>
</PageLayout>

<style>
</style>
