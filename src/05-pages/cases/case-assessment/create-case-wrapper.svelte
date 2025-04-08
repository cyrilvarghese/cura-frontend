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

    // Update type definition for location

    onMount(() => {
        console.log("Route Location:", location);
    });
</script>

<PageLayout
    breadcrumbs={[
        { label: "Curriculum", href: "/curriculum" },
        { label: "New Case", href: "/" },
    ]}
>
    <CreateCase type="new" />
</PageLayout>
