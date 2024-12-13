<script>
    import { onMount } from 'svelte';
    import ExaminationItemEditor from './ExaminationItemEditor.svelte';
    import { Button } from "$lib/components/ui/button"; // Importing button from shadcn
    import examinationDataJson from '$lib/data/examination-data.json'; // Importing the static JSON data

    let examinationData = {};

    onMount(() => {
        // Load the static JSON data
        examinationData = examinationDataJson;
    });

    // Function to handle updates to the examination data
    /**
     * @param {{}} updatedData
     */
    function updateExaminationData(updatedData) {
        examinationData = { ...examinationData, ...updatedData };
    }
    // Derived entries for iteration
    $: examinationEntries = Object.entries(examinationData);

    // Function to save changes (could be an API call)
    function saveChanges() {
        console.log("Updated Examination Data:", examinationData);
        // Here you can implement the logic to save the updated data
    }
</script>

<div class="p-4">
    <h2 class="text-lg font-bold">Examination Results</h2>
    {#each examinationEntries as [key, value]}
        {console.log(key, value)}
        <ExaminationItemEditor 
            {key} 
            {value} 
            onUpdate={updateExaminationData} 
        />
    {/each}
    <Button onclick={saveChanges} class="mt-4">Save Changes</Button>
</div> 