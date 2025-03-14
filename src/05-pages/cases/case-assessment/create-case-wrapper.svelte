<script lang="ts">
    import PageLayout from "../../../04-templates/page-layout.svelte";
    import CreateCase from "./create-case.svelte";
    import {
        uploadedFileStore,
        caseIdStore,
    } from "$lib/stores/caseCreationFileUploadStore";
    import { onMount } from "svelte";

    // Initialize stores if needed
    uploadedFileStore.set(null);
    caseIdStore.set("");
    let { topic, code } = $props();

    onMount(() => {
        console.log(topic, code);
    });
</script>

<PageLayout
    breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Curriculum", href: "/curriculum" },
        { label: "Add Assessment", href: "/curriculum" },
        { label: "Case" },
    ]}
>
    <div class="bg-muted/50 rounded-xl w-full h-full flex flex-col">
        <!-- Title Section with Action Buttons -->
        <div class="p-4 border-b border-gray-300">
            <h2 class="text-2xl font-semibold text-gray-800">
                Generate Case Data
            </h2>
            <p class="text-sm text-gray-500">
                Create case data for a clinical case
            </p>
        </div>

        <div class="p-4">
            <CreateCase topic={topic} code={code} />
        </div>
    </div>
</PageLayout>
