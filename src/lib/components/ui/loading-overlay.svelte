<script lang="ts">
    export let message = "Loading...";
    export let isVisible = true;
</script>

{#if isVisible}
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
        <div
            class="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center space-y-4"
        >
            <div
                class="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"
            ></div>
            <p class="text-lg font-medium text-gray-700">{message}</p>
        </div>
    </div>
{/if}
