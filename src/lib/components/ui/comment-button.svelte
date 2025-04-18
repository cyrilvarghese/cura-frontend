<script lang="ts">
    import { onDestroy } from "svelte";
    import MessageSquare from "lucide-svelte/icons/message-square";
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import { Badge } from "$lib/components/ui/badge";
    import { editPhysicalExamTableStore } from "$lib/stores/editTablePEStore";
    import X from "lucide-svelte/icons/x";
    import Check from "lucide-svelte/icons/check";
    import { AlertCircle, AlertTriangle, FlagIcon } from "lucide-svelte";

    const {
        caseId,
        testName,
        testType,
        initialCommentCount = 0,
        initialComments = [],
    } = $props<{
        caseId: string;
        testName: string;
        testType: string;
        initialCommentCount?: number;
        initialComments?: string[];
    }>();

    let comment = $state("");
    let comments = $state(initialComments);
    let isPopoverOpen = $state(false);
    let currentCommentCount = $state(initialCommentCount);

    const unsubscribe = editPhysicalExamTableStore.subscribe((state) => {
        if (state.testName === testName && state.totalComments !== undefined) {
            currentCommentCount = state.totalComments;
            comments = state.comments;
        }
    });

    onDestroy(() => unsubscribe());

    async function handleSaveComment() {
        const success = await editPhysicalExamTableStore.addComment(
            caseId,
            testName,
            testType,
            comment,
        );

        if (success) {
            comment = ""; // Reset comment after saving
        }
    }

    async function handleRemoveComment(commentIndex: number) {
        const success = await editPhysicalExamTableStore.removeComment(
            caseId,
            testName,
            testType,
            commentIndex,
        );
    }
</script>

<div class="relative">
    <Popover.Root bind:open={isPopoverOpen}>
        <Popover.Trigger>
            {#snippet child({ props })}
                <Button
                    variant="ghost"
                    title="Report Errors"
                    size="icon"
                    class="h-8 w-8 text-red-500"
                    {...props}
                >
                    <FlagIcon class="h-4 w-4" />
                    <span class="sr-only">Report Errors</span>

                    {#if currentCommentCount > 0}
                        <Badge
                            class="absolute -top-0 bg-red-500 text-white -right-0 h-4 min-w-4 px-1"
                            variant="default"
                        >
                            {currentCommentCount}
                        </Badge>
                    {/if}
                </Button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-80">
            <!-- add a list of comments -->
            <div class="space-y-2">
                <Label for="comments">Comments</Label>
                <div class="flex flex-wrap gap-2">
                    {#each comments as comment, index}
                        <div
                            class="flex items-center bg-muted px-3 py-1 rounded-full text-sm"
                        >
                            <span>{comment}</span>
                            <button
                                class="ml-2 text-muted-foreground hover:text-foreground"
                                onclick={() => handleRemoveComment(index)}
                            >
                                <Check class="h-3 w-3" />
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="grid gap-4">
                <div class="space-y-2">
                    <Label for="comment">Add Comment</Label>
                    <Textarea
                        id="comment"
                        bind:value={comment}
                        placeholder="Type your comment here..."
                        class="min-h-[100px]"
                    />
                </div>
                <div class="flex justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!comment}
                        onclick={handleSaveComment}
                    >
                        Save Comment
                    </Button>
                </div>
            </div>
        </Popover.Content>
    </Popover.Root>
</div>
