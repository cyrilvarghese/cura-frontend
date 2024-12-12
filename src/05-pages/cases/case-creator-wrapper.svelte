<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import CaseCreator from "./case-creator.svelte";
</script>

<div>
    <div
        class="flex flex-1 flex-col p-4 gap-4   h-[calc(100vh-6px)]"
    >
        <div class="pl-[64px]">
            <Breadcrumb.Root>
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/">Tools</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/cases"
                            >Create Case Data</Breadcrumb.Link
                        >
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>
        <div class="flex flex-col gap-4">
            <div class="bg-muted/50 rounded-xl w-full h-full flex flex-col">
                <!-- Title Section with Action Buttons -->
                <div class="p-4 border-b border-gray-300 ">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        Generate Case Data
                    </h2>
                        <p class="text-sm text-gray-500">
                            Create case data for a clinical case
                        </p>
                    </div>
                 
                <div class="p-4">
                    <CaseCreator />
                </div>
            </div>
        </div>
    </div>
</div>
