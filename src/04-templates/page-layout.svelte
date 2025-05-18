<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    export let breadcrumbs: { label: string; href?: string }[] = [];
    export let hideNav = false; // New prop to control navigation visibility

    // Get the sidebar state
    const sidebar = useSidebar();
</script>

<div
    class="flex flex-1 flex-col p-4 gap-4 {sidebar.state === 'expanded'
        ? 'w-[calc(100vw-256px)]'
        : 'w-[100vw]'} h-[calc(100vh)]"
>
    {#if !hideNav}
        <div class="pl-[64px]">
            <Breadcrumb.Root>
                <Breadcrumb.List>
                    {#each breadcrumbs as crumb, i}
                        <Breadcrumb.Item>
                            {#if crumb.href}
                                <Breadcrumb.Link href={crumb.href}
                                    >{crumb.label}</Breadcrumb.Link
                                >
                            {:else}
                                <Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
                            {/if}
                        </Breadcrumb.Item>
                        {#if i < breadcrumbs.length - 1}
                            <Breadcrumb.Separator />
                        {/if}
                    {/each}
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>
    {/if}

    <div
        class="flex gap-4 w-full h-full {hideNav
            ? 'h-[100vh]'
            : 'h-[calc(100vh-64px)]'}"
    >
        <div class="w-full h-full flex flex-col p-6 pt-0">
            <slot />
        </div>
    </div>
</div>
