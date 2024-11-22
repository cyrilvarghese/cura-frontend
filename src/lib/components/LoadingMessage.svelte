<script lang="ts">
    import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<div class="flex items-center space-x-4">
    <Skeleton class="size-12 rounded-full" />
    <div class="space-y-2">
        <Skeleton class="h-4 w-[50px]" />
        <Skeleton class="h-4 w-[30px]" />
    </div>
</div>
