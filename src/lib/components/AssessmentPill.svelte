<script lang="ts">
    import { assessmentStore } from "$lib/stores/assessmentStore";
    import { toast } from "svelte-sonner";

    const { assessment, onDelete } = $props<{
        assessment: { id: number; url?: string; title: string };
        onDelete?: (id: number) => void;
    }>();

    async function handleDelete() {
        try {
            await assessmentStore.deleteAssessment(assessment.id);
            toast.success("Assessment deleted successfully");
            // Call the callback prop instead of dispatching an event
            onDelete?.(assessment.id);
        } catch (error) {
            toast.error("Failed to delete assessment");
            console.error("Failed to delete assessment:", error);
        }
    }
</script>

<div class="inline-flex items-center gap-1">
    <a
        href={assessment.url}
        class="inline-flex items-center px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-l-full hover:bg-blue-100 transition-colors"
    >
        {assessment.title}
    </a>
    <button
        onclick={handleDelete}
        class="inline-flex items-center px-2 py-1 text-sm bg-blue-50 text-red-700 rounded-r-full hover:bg-red-100 transition-colors"
    >
        ×
    </button>
</div>
