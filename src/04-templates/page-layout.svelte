<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    export let breadcrumbs: { label: string; href?: string }[] = [];
</script>

<div>
    <div
        class="flex flex-1 flex-col p-4 gap-4 w-[calc(100vw-256px)] h-[calc(100vh)]"
    >
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

        <div class="flex gap-4 w-full h-full h-[calc(100vh-64px)]">
            <div class="w-full h-full flex flex-col p-6">
                <slot />
            </div>
        </div>
    </div>
</div>
