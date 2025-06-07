<script lang="ts">
    import { casesListStore } from "$lib/stores/casePlayerStore";
    import { currentDepartment } from "$lib/stores/teamStore";
    import { onMount } from "svelte";
    import { fetchCases } from "$lib/stores/casePlayerStore";
    import { API_BASE_URL } from "$lib/config/api";
    import PageLayout from "../04-templates/page-layout.svelte";
    import CaseItem from "../04-templates/case-item.svelte";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    import { Link } from "svelte-routing";
    import * as Tabs from "$lib/components/ui/tabs";
    import { FileCheck } from "lucide-svelte";
    import type { CaseListItem } from "$lib/services/caseDataService";
    import { authStore } from "$lib/stores/authStore";
    import type { AuthState } from "$lib/stores/authStore";
    let cases: CaseListItem[] = $state([]);
    let searchQuery = $state("");
    let activeTab = $state("published");
    let user: AuthState["user"] | undefined = $state();
    let isLoading = $state(false);
    authStore.subscribe((state) => {
        user = state.user;
        if (user) {
            console.log("Current user role:", user.role);
            activeTab = user.role === "admin" ? "drafts" : "published";
        }
    });
    onMount(async () => {
        isLoading = true;
        try {
            await fetchCases();
            cases = $casesListStore || [];
        } finally {
            isLoading = false;
        }
    });

    // Refresh function to be passed to CaseItem components
    const handleRefresh = async () => {
        isLoading = true;
        try {
            await fetchCases();
            cases = $casesListStore || [];
        } finally {
            isLoading = false;
        }
    };

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
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold">Case Library</h1>
            <p class="text-gray-500 text-sm">
                A collection of cases for you to learn from.
            </p>
        </div>
        <div class="relative">
            <input
                type="search"
                placeholder="Search..."
                bind:value={searchQuery}
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    <Tabs.Root
        value={activeTab}
        class="mb-6"
        onValueChange={(value: string) => (activeTab = value)}
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
                {#if filteredCases.length === 0}
                    <div class="col-span-full text-center py-16">
                        <FileCheck
                            class="w-12 h-12 text-gray-400 mx-auto mb-3"
                        />
                        <p class="text-gray-500 text-lg">
                            No published cases available for this department.
                        </p>
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {#each filteredCases as caseItem}
                            <CaseItem
                                {caseItem}
                                {user}
                                isPublished={true}
                                onRefresh={handleRefresh}
                            />
                        {/each}
                    </div>
                {/if}
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
                            {activeTab === "drafts"
                                ? "All cases are currently published."
                                : "No cases are published."}
                        </p>
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {#each filteredCases as caseItem}
                            <CaseItem
                                {caseItem}
                                {user}
                                isPublished={false}
                                onRefresh={handleRefresh}
                            />
                        {/each}
                    </div>
                {/if}
            </Tabs.Content>
        </div>
    </Tabs.Root>
</PageLayout>

<LoadingOverlay message="Loading cases..." isVisible={isLoading} />

<style>
</style>
