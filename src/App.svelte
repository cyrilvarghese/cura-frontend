<script lang="ts">
  import "./app.css";
  import MainLayout from "./04-templates/main-layout/index.svelte";

  // Get the current URL for the router
  let url = window.location.pathname;
</script>

<main class="min-h-screen bg-background">
  <MainLayout {url} />
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
