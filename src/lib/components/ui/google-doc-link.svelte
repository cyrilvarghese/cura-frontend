<script lang="ts">
    export let docName: string;
    export let docLink: string | null;
</script>

{#if docLink}
    <a
        href={docLink}
        target="_blank"
        class="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
    >
        {docName}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
        >
            <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    </a>
{:else}
    <span class="text-gray-600">{docName}</span>
{/if}
