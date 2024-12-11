<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import CaseCreator from "./case-creator.svelte";
</script> 

<div class="pt-5 flex flex-col items-start justify-start">
    <div class="pl-[48px] flex flex-col gap-8 w-full">
       
        <Breadcrumb.Root class="pl-[24px]">
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/">Cases</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/cases">Diagnosis</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb.List>
        </Breadcrumb.Root>
        <div class="flex flex-col gap-4">
            <h1 class="text-xl font-bold tracking-tight">
                Create Patient Persona
            </h1>
            <CaseCreator class="border border-gray-200 rounded-md p-4" />
        </div>
    </div>
</div>
