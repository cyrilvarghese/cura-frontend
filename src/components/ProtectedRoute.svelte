<script>
    import { isAuthenticated } from "../stores/authStore";
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";

    export let path;
    export let component;
    export let params = {};

    let auth = false;

    onMount(() => {
        const unsubscribe = isAuthenticated.subscribe((value) => {
            auth = value;
            if (!auth) {
                navigate("/login"); // Redirect to login if not authenticated
            }
        });

        return () => unsubscribe();
    });
</script>

{#if auth}
    <svelte:component this={component} {...params} />
{/if}
