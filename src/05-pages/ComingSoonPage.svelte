<script lang="ts">
    import { API_BASE_URL } from "$lib/config/api";
    import * as Card from "$lib/components/ui/card";
    import { toast } from "svelte-sonner";
    let { title } = $props<{ title: string }>();
    let isLoading = $state(false);

    async function requestAccess() {
        try {
            isLoading = true;
            const response = await fetch(
                `${API_BASE_URL}/request-access?title=${encodeURIComponent(title)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            if (!response.ok) throw new Error("Request failed");
            const data = await response.json();
            console.log(data);
            toast.success("Access requested successfully");
        } catch (error) {
            console.error("Failed to request access:", error);
            toast.error("Failed to request access");
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto px-10 py-20">
    <div class="flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">{title}</h1>
        </div>

        <Card.Root>
            <Card.Content
                class="flex flex-col items-center justify-center py-16"
            >
                <h2 class="text-2xl font-semibold text-muted-foreground mb-4">
                    Coming Soon
                </h2>
                <p class="text-muted-foreground">
                    This feature is currently under development.
                </p>
                <button
                    onclick={requestAccess}
                    class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Request Access
                </button>
                <div class="mt-8 w-16 h-1 bg-primary rounded-full"></div>
            </Card.Content>
        </Card.Root>
    </div>
</div>
