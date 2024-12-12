<script lang="ts">
    let { content = '' } = $props();
</script>

<div class="markdown-content">
    {@html content}
</div>

<style lang="postcss">
    .markdown-content {
        @apply max-w-none leading-relaxed;

        /* Headings */
        :global(h1) {
            @apply text-3xl font-bold mb-4 text-slate-900;
        }
        :global(h2) {
            @apply text-2xl font-semibold mb-3 border-b pb-2 text-slate-700;
        }
        :global(h3) {
            @apply text-xl font-medium mb-2 text-slate-600;
        }
        :global(h4) {
            @apply text-lg font-medium mb-2 text-slate-600;
        }
        :global(hr) {
            @apply border-t border-gray-200 my-4;
        }

        /* Typography */
        :global(p) {
            @apply mb-4 text-base;
        }

        /* Lists */
        :global(ul) {
            @apply list-disc pl-6 mb-4 space-y-2;
        }
        :global(ol) {
            @apply list-decimal pl-6 mb-4 space-y-2;
        }

        /* Links */
        :global(a) {
            @apply text-blue-600 hover:underline hover:text-blue-800 transition-colors;
        }

        /* Code */
        :global(code) {
            @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono;
        }
        :global(pre) {
            @apply bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4;
        }

        /* Blockquotes */
        :global(blockquote) {
            @apply border-l-4 border-primary pl-4 italic text-gray-600 mb-4;
        }

        /* Tables */
        :global(table) {
            @apply w-full border-collapse mb-4;
        }
        :global(th) {
            @apply bg-gray-100 border p-2 text-left font-semibold;
        }
        :global(td) {
            @apply border p-2;
        }
    }
</style> 