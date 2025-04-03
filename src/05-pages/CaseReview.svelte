<script lang="ts">
    import { onMount } from "svelte";
    import { googleDocsStore } from "$lib/stores/googleDocsStore";
    import PageLayout from "../04-templates/page-layout.svelte";
    import * as Tabs from "$lib/components/ui/tabs";
    import {
        ClipboardCheck,
        Search,
        Filter,
        CheckCheck,
        CheckCircle,
        RefreshCw,
        Trash2,
        Loader2,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import type { GoogleDoc } from "$lib/services/googleDocsService";
    import { Skeleton } from "$lib/components/ui/skeleton";

    // Direct state declarations without import
    let searchQuery = $state("");
    let activeTab = $state("pending");
    let isLoading = $state(true);
    let isLoadingComments = $state(false);
    let deletingDocIds = $state(new Set<string>());
    let isDeleting = $state(false);

    function transformStatus(status: string) {
        const statusMap: { [key: string]: string } = {
            CASE_REVIEW_PENDING: "Case Review Pending",
            CASE_REVIEW_IN_PROGRESS: "Case Review in Progress",
            CASE_REVIEW_COMPLETE: "Case Review Complete",
            DATA_REVIEW_IN_PROGRESS: "Data Review in Progress",
            PUBLISHED: "Published",
        };
        return statusMap[status] || status;
    }

    function transformApiResponse(docs: GoogleDoc[]) {
        return docs.map((doc) => ({
            title: doc.name,
            docLink: doc.webViewLink,
            status: transformStatus(doc.status),
            submittedDate: doc.modifiedTime,
            commentCount: doc.commentCount,
            docId: doc.id,
        }));
    }

    let caseReviews = $derived(transformApiResponse($googleDocsStore));

    onMount(async () => {
        await googleDocsStore.loadDocs();
        isLoading = false;
    });

    // Reactive statement using $derived instead of $:
    let filteredCases = $derived(
        caseReviews.filter(
            (review) =>
                (activeTab === "pending"
                    ? review.status === "Case Review Pending" ||
                      review.status === "Case Review in Progress"
                    : review.status === "Case Review Complete" ||
                      review.status === "Data Review in Progress") &&
                (!searchQuery ||
                    review.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    review.docLink
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
        ),
    );

    function getStatusColor(status: string) {
        switch (status) {
            case "Case Review Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Case Review in Progress":
                return "bg-blue-100 text-blue-800";
            case "Case Review Complete":
                return "bg-green-100 text-green-800";
            case "Data Review in Progress":
                return "bg-purple-100 text-purple-800";
            case "Published":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    function getPriorityColor(priority: string) {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800";
            case "Medium":
                return "bg-orange-100 text-orange-800";
            case "Low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    async function handleRefreshComments(docId: string) {
        isLoadingComments = true;
        try {
            await googleDocsStore.refreshCommentCount(docId);
        } finally {
            isLoadingComments = false;
        }
    }

    async function handleDelete(docId: string, title: string) {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            isDeleting = true;
            try {
                const success = await googleDocsStore.deleteDoc(docId, title);
            } finally {
                isDeleting = false;
            }
        }
    }
</script>

<PageLayout
    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Review" }]}
>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Case Review</h1>
        <div class="relative">
            <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
            />
            <input
                type="search"
                placeholder="Search cases..."
                bind:value={searchQuery}
                class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    <p class="text-gray-500 mb-8">
        Review and manage submitted cases from your department.
    </p>

    <Tabs.Root
        value={activeTab}
        class="mb-8"
        onValueChange={(value) => (activeTab = value)}
    >
        <Tabs.List>
            <Tabs.Trigger value="pending">Pending Reviews</Tabs.Trigger>
            <Tabs.Trigger value="completed">Completed Reviews</Tabs.Trigger>
        </Tabs.List>
        <hr class="my-4 border-gray-200" />

        <div class="mt-6">
            <Tabs.Content
                value="pending"
                class="animate-in fade-in duration-500"
            >
                <div class="overflow-x-auto">
                    {#if isLoading}
                        <div class="w-full">
                            <div class="space-y-3">
                                {#each Array(5) as _}
                                    <div class="flex items-center space-x-4">
                                        <Skeleton class="h-12 w-[4%]" />
                                        <Skeleton class="h-12 w-[30%]" />
                                        <Skeleton class="h-12 w-[10%]" />
                                        <Skeleton class="h-12 w-[20%]" />
                                        <Skeleton class="h-12 w-[20%]" />
                                        <Skeleton class="h-12 w-[16%]" />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {:else if filteredCases.length === 0}
                        <div class="text-center py-16">
                            <ClipboardCheck
                                class="w-12 h-12 text-gray-400 mx-auto mb-3"
                            />
                            <p class="text-gray-500 text-lg">
                                No pending reviews found.
                            </p>
                        </div>
                    {:else}
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b">
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        S.No
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Title
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Comments
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Last Updated On
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each filteredCases as review, index}
                                    <tr class="hover:bg-gray-50">
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            <a
                                                href={review.docLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="text-blue-600 hover:text-blue-800"
                                            >
                                                {review.title}
                                            </a>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {#if review.commentCount === 0}
                                                <button
                                                    class="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                    on:click={() =>
                                                        handleRefreshComments(
                                                            review.docId,
                                                        )}
                                                >
                                                    <RefreshCw
                                                        class="h-5 w-5 text-gray-600 {isLoadingComments
                                                            ? 'animate-spin'
                                                            : ''}"
                                                        strokeWidth={2.5}
                                                    />
                                                </button>
                                            {:else}
                                                <button
                                                    class="hover:bg-gray-100 rounded-full transition-colors"
                                                    on:click={() =>
                                                        handleRefreshComments(
                                                            review.docId,
                                                        )}
                                                >
                                                    <span
                                                        class="relative inline-flex items-center px-2 py-1"
                                                    >
                                                        <span
                                                            class="text-xs rounded-full bg-gray-100 text-gray-800"
                                                        >
                                                            {review.commentCount}
                                                        </span>
                                                        {#if isLoadingComments}
                                                            <RefreshCw
                                                                class="h-4 w-4 text-gray-600 animate-spin absolute right-0 translate-x-full ml-1"
                                                                strokeWidth={2.5}
                                                            />
                                                        {/if}
                                                    </span>
                                                </button>
                                            {/if}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {#if review.status === "Case Review Pending"}
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        href={review.docLink}
                                                        target="_blank"
                                                    >
                                                        Review Case
                                                    </Button>
                                                    <Button
                                                        class="ml-4"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting}
                                                        onclick={() =>
                                                            handleDelete(
                                                                review.docId,
                                                                review.title,
                                                            )}
                                                    >
                                                        {#if isDeleting}
                                                            <Loader2
                                                                class="h-4 w-4 text-red-600 animate-spin"
                                                            />
                                                        {:else}
                                                            <Trash2
                                                                class="h-4 w-4 text-red-600 hover:text-red-700"
                                                            />
                                                        {/if}
                                                    </Button>
                                                </div>
                                            {:else if review.status === "Case Review in Progress"}
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Complete Review
                                                </Button>
                                            {:else if review.status === "Case Review Complete"}
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Generate Data
                                                </Button>
                                            {:else if review.status === "Data Review in Progress"}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    class="mr-3"
                                                >
                                                    Review Data
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Publish
                                                    <CheckCircle
                                                        class="ml-2 h-4 w-4"
                                                    />
                                                </Button>
                                            {:else}
                                                <span class="text-gray-400"
                                                    >Published</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {new Date(
                                                review.submittedDate,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </Tabs.Content>

            <Tabs.Content
                value="completed"
                class="animate-in fade-in duration-500"
            >
                <div class="overflow-x-auto">
                    {#if isLoading}
                        <div class="w-full">
                            <div class="space-y-3">
                                {#each Array(5) as _}
                                    <div class="flex items-center space-x-4">
                                        <Skeleton class="h-12 w-[4%]" />
                                        <Skeleton class="h-12 w-[30%]" />
                                        <Skeleton class="h-12 w-[10%]" />
                                        <Skeleton class="h-12 w-[20%]" />
                                        <Skeleton class="h-12 w-[20%]" />
                                        <Skeleton class="h-12 w-[16%]" />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {:else if filteredCases.length === 0}
                        <div class="text-center py-16">
                            <ClipboardCheck
                                class="w-12 h-12 text-gray-400 mx-auto mb-3"
                            />
                            <p class="text-gray-500 text-lg">
                                No completed reviews found.
                            </p>
                        </div>
                    {:else}
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b">
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        S.No
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Title
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Comments
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Last Updated On
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each filteredCases as review, index}
                                    <tr class="hover:bg-gray-50">
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                        >
                                            {index + 1}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            <a
                                                href={review.docLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="text-blue-600 hover:text-blue-800"
                                            >
                                                {review.title}
                                            </a>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {#if review.commentCount === 0}
                                                <button
                                                    class="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                    on:click={() =>
                                                        handleRefreshComments(
                                                            review.docId,
                                                        )}
                                                >
                                                    <RefreshCw
                                                        class="h-5 w-5 text-gray-600 {isLoadingComments
                                                            ? 'animate-spin'
                                                            : ''}"
                                                        strokeWidth={2.5}
                                                    />
                                                </button>
                                            {:else}
                                                <button
                                                    class="hover:bg-gray-100 rounded-full transition-colors"
                                                    on:click={() =>
                                                        handleRefreshComments(
                                                            review.docId,
                                                        )}
                                                >
                                                    <span
                                                        class="relative inline-flex items-center px-2 py-1"
                                                    >
                                                        <span
                                                            class="text-xs rounded-full bg-gray-100 text-gray-800"
                                                        >
                                                            {review.commentCount}
                                                        </span>
                                                        {#if isLoadingComments}
                                                            <RefreshCw
                                                                class="h-4 w-4 text-gray-600 animate-spin absolute right-0 translate-x-full ml-1"
                                                                strokeWidth={2.5}
                                                            />
                                                        {/if}
                                                    </span>
                                                </button>
                                            {/if}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {#if review.status === "Case Review Pending"}
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        href={review.docLink}
                                                        target="_blank"
                                                    >
                                                        Review Case
                                                    </Button>
                                                    <Button
                                                        class="ml-4"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting}
                                                        onclick={() =>
                                                            handleDelete(
                                                                review.docId,
                                                                review.title,
                                                            )}
                                                    >
                                                        {#if isDeleting}
                                                            <Loader2
                                                                class="h-4 w-4 text-red-600 animate-spin"
                                                            />
                                                        {:else}
                                                            <Trash2
                                                                class="h-4 w-4 text-red-600 hover:text-red-700"
                                                            />
                                                        {/if}
                                                    </Button>
                                                </div>
                                            {:else if review.status === "Case Review in Progress"}
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Complete Review
                                                </Button>
                                            {:else if review.status === "Case Review Complete"}
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Generate Data
                                                </Button>
                                            {:else if review.status === "Data Review in Progress"}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    class="mr-3"
                                                >
                                                    Review Data
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                >
                                                    Publish
                                                    <CheckCircle
                                                        class="ml-2 h-4 w-4"
                                                    />
                                                </Button>
                                            {:else}
                                                <span class="text-gray-400"
                                                    >Published</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {new Date(
                                                review.submittedDate,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </Tabs.Content>
        </div>
    </Tabs.Root>
</PageLayout>
