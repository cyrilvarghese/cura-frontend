<script lang="ts">
    import { Link } from "svelte-routing";
    import { Pencil, Trash2, EyeOff } from "lucide-svelte";
    import { API_BASE_URL } from "$lib/config/api";
    import type { CaseListItem } from "$lib/services/caseDataService";
    import type { AuthState } from "$lib/stores/authStore";
    import { unpublishCase, deleteCase } from "$lib/stores/casePlayerStore";

    interface Props {
        caseItem: CaseListItem;
        user: AuthState["user"] | undefined;
        isPublished: boolean;
        onRefresh?: () => Promise<void>;
    }

    let { caseItem, user, isPublished, onRefresh }: Props = $props();
    let isProcessing = $state(false);

    const handleUnpublish = async (e: Event) => {
        e.stopPropagation();
        if (isProcessing) return;

        isProcessing = true;
        try {
            await unpublishCase(caseItem.case_id.toString());
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error("Failed to unpublish case:", error);
            // TODO: Show user-friendly error message
        } finally {
            isProcessing = false;
        }
    };

    const handleDelete = async (e: Event) => {
        e.stopPropagation();
        if (isProcessing) return;

        // Add confirmation dialog
        if (
            !confirm(
                "Are you sure you want to delete this case? This action cannot be undone.",
            )
        ) {
            return;
        }

        isProcessing = true;
        try {
            await deleteCase(caseItem.case_id.toString());
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error("Failed to delete case:", error);
            // TODO: Show user-friendly error message
        } finally {
            isProcessing = false;
        }
    };
</script>

<div class="animate-in fade-in duration-500">
    <div
        class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
    >
        <Link to={`/case-library/${caseItem.case_id}`} class="block">
            <div class="relative aspect-square">
                <img
                    src={API_BASE_URL + caseItem.image_url ||
                        "/placeholder-image.jpg"}
                    alt={caseItem.title}
                    class="object-cover absolute inset-0 w-full h-full transition-transform duration-300 hover:scale-[1.05]"
                />
            </div>
            <div class="p-4">
                {#if user?.role === "admin"}
                    <span
                        class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 break-words max-w-full"
                    >
                        {caseItem.case_name}
                    </span>
                {/if}

                <h3 class="font-semibold capitalize text-lg transition-colors">
                    {caseItem.title || "Untitled Case"}
                </h3>
                <p class="text-gray-600 text-sm mt-1 line-clamp-2">
                    {caseItem.quote || "No description available"}
                </p>
            </div>
        </Link>

        {#if user?.role === "admin"}
            <div
                class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
                <div class="p-3 flex gap-2 justify-end pointer-events-auto">
                    <Link
                        to={`/case-library/edit?caseId=${caseItem.case_id}`}
                        class="p-2 text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors backdrop-blur-sm"
                        title="Edit case"
                    >
                        <Pencil class="w-4 h-4" />
                    </Link>

                    {#if isPublished}
                        <button
                            class="p-2 text-white bg-orange-500/80 hover:bg-orange-500 rounded-md transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Unpublish case"
                            disabled={isProcessing}
                            onclick={handleUnpublish}
                        >
                            <EyeOff class="w-4 h-4" />
                        </button>
                    {:else}
                        <button
                            class="p-2 text-white bg-red-500/80 hover:bg-red-500 rounded-md transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete case"
                            disabled={isProcessing}
                            onclick={handleDelete}
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>
