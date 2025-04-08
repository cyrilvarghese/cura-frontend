<script lang="ts">
    import PageLayout from "../../04-templates/page-layout.svelte";
    import CreateCase from "./case-assessment/create-case.svelte";
</script>

<PageLayout
    breadcrumbs={[
        { label: "Case Library", href: "/case-library" },
        { label: "Edit Case", href: "/" },
    ]}
>
    <CreateCase type="edit" />
</PageLayout>
