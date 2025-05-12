<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { googleDocsStore } from "$lib/stores/googleDocsStore";
    import PageLayout from "../04-templates/page-layout.svelte";
    import mixpanel from "mixpanel-browser";
    import {
        ClipboardCheck,
        Search,
        RefreshCw,
        MoreVertical,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import type { GoogleDoc } from "$lib/services/googleDocsService";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import DocumentUploadButton from "$lib/components/DocumentUploadButton.svelte";
    import { navigate } from "svelte-routing";
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger,
    } from "$lib/components/ui/dropdown-menu";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { currentDepartment } from "$lib/stores/teamStore";
    import { get } from "svelte/store";
    // Direct state declarations without import
    let searchQuery = $state("");
    let isLoading = $state(true);
    let isLoadingComments = $state(false);
    let deletingDocIds = $state(new Set<string>());
    let isDeleting = $state(false);
    let isApproving = $state(false);
    let isUploading = $state(false);
    let showPendingOnly = $state(false);
    let departmentId = $state("");
    function transformStatus(status: string) {
        const statusMap: { [key: string]: string } = {
            CASE_REVIEW_PENDING: "Document Review Pending",
            CASE_REVIEW_IN_PROGRESS: "Document Review in Progress",
            CASE_REVIEW_COMPLETE: "Document Review Complete",
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
            approvedBy: doc.approved_by_username,
        }));
    }

    let caseReviews = $derived(transformApiResponse($googleDocsStore));

    const departmentUnsubscribe = currentDepartment.subscribe(async (dept) => {
        if (dept) {
            departmentId = dept.id;
        }
        await googleDocsStore.loadDocs(departmentId);
    });
    onDestroy(() => {
        departmentUnsubscribe();
    });

    onMount(async () => {
        debugger;
        await googleDocsStore.loadDocs(departmentId);
        isLoading = false;
    });

    // Modify the filtered cases to remove tab filtering
    let filteredCases = $derived(
        caseReviews.filter((review) => {
            // First apply search filter
            const matchesSearch =
                !searchQuery ||
                review.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                review.docLink
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            // Then apply pending filter if enabled
            return (
                matchesSearch &&
                (!showPendingOnly ||
                    review.status === "Document Review Pending")
            );
        }),
    );

    function getStatusColor(status: string) {
        switch (status) {
            case "Document Review Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Document Review in Progress":
                return "bg-blue-100 text-blue-800";
            case "Document Review Complete":
                return "bg-green-100 text-green-800";
            case "   Review in Progress":
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
                if (success) {
                    await googleDocsStore.loadDocs();
                }
            } finally {
                isDeleting = false;
            }
        }
    }

    async function handleApproveCase(docId: string) {
        isApproving = true;
        try {
            const success = await googleDocsStore.approveCase(docId);
            if (success) {
                await googleDocsStore.loadDocs();
            }
        } finally {
            isApproving = false;
        }
    }

    async function handleGenerateData(
        docId: string,
        fileName: string,
        googleDocLink: string,
    ) {
        // Navigate with the fileName as a query parameter
        navigate(
            `/curriculum/new-case?fileName=${encodeURIComponent(fileName)}&googleDocLink=${encodeURIComponent(googleDocLink)}`,
        );
    }

    async function handleGenerateOSCE(docId: string, title: string) {
        console.log("Generate OSCE clicked:", { docId, title });
    }

    async function handleGenerateMCQ(docId: string, title: string) {
        console.log("Generate MCQ clicked:", { docId, title });
    }
</script>

<PageLayout
    breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Review" }]}
>
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold">Master Document Review</h1>
            <p class="text-gray-500 text-sm">
                Review and manage submitted master documents from your
                department.
            </p>
        </div>
        <div class="flex items-center gap-4">
            <div class="relative">
                <Search
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                />
                <input
                    type="search"
                    placeholder="Search master documents..."
                    bind:value={searchQuery}
                    class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
            <DocumentUploadButton
                topicName="Master Document"
                onSuccess={() => {
                    googleDocsStore.loadDocs($currentDepartment.id);
                }}
            />
        </div>
    </div>

    <div class="mb-4 flex justify-end">
        <div class="flex items-center space-x-2">
            <Checkbox
                id="pendingFilter"
                bind:checked={showPendingOnly}
                aria-labelledby="pending-filter-label"
            />
            <Label
                id="pending-filter-label"
                for="pendingFilter"
                class="text-gray-700 cursor-pointer"
            >
                Show Pending Review Only
            </Label>
        </div>
    </div>

    <div class="mt-4">
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
                    <p class="text-gray-500 text-lg">No cases found.</p>
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
                                class="w-[400px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Title
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Last Updated On
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Status
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Approved By
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Actions
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
                                    class="w-[400px] px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    <div class="flex items-center gap-4">
                                        <Tooltip.Provider>
                                            <Tooltip.Root>
                                                <Tooltip.Trigger>
                                                    <a
                                                        href={review.docLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[300px]"
                                                        onclick={() => {
                                                            // Track the click event
                                                            console.log(
                                                                `Document clicked: ${review.title}`,
                                                            );
                                                            mixpanel.track(
                                                                "Document Link Clicked",
                                                                {
                                                                    "doc ID":
                                                                        review.docId,
                                                                    "doc title":
                                                                        review.title,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        {review.title}
                                                    </a>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content
                                                    side="bottom"
                                                    sideOffset={5}
                                                    class="bg-stone-100 text-blue-900 border-blue-200 border px-3 py-1.5 rounded-md text-sm"
                                                >
                                                    <p>{review.title}</p>
                                                </Tooltip.Content>
                                            </Tooltip.Root>
                                        </Tooltip.Provider>

                                        <div class="flex-shrink-0">
                                            {#if review.commentCount === 0}
                                                <button
                                                    class="hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                    onclick={() =>
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
                                                    onclick={() =>
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
                                        </div>
                                    </div>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    {new Date(
                                        review.submittedDate,
                                    ).toLocaleString()}
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
                                    {review.approvedBy}
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical class="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {#if review.status === "Document Review Pending"}
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        window.open(
                                                            review.docLink,
                                                            "_blank",
                                                        )}
                                                >
                                                    Review Document
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        handleApproveCase(
                                                            review.docId,
                                                        )}
                                                >
                                                    Approve
                                                </DropdownMenuItem>
                                            {:else if review.status === "Document Review Complete"}
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        handleGenerateData(
                                                            review.docId,
                                                            review.title,
                                                            review.docLink,
                                                        )}
                                                >
                                                    New Case
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        handleGenerateOSCE(
                                                            review.docId,
                                                            review.title,
                                                        )}
                                                >
                                                    New OSCE
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        handleGenerateMCQ(
                                                            review.docId,
                                                            review.title,
                                                        )}
                                                >
                                                    New MCQ
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        handleApproveCase(
                                                            review.docId,
                                                        )}
                                                >
                                                    Update
                                                </DropdownMenuItem>
                                            {/if}

                                            <DropdownMenuItem
                                                onclick={() =>
                                                    handleDelete(
                                                        review.docId,
                                                        review.title,
                                                    )}
                                                class="text-red-600"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    </div>
</PageLayout>
