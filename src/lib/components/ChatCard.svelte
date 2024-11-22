<script lang="ts">
    export let message: string;
    export let sender: string;
    export let timestamp: string;
</script>

<div class="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
    <div class="font-bold">{sender}</div>
    <div class="text-gray-700">{message}</div>
    <div class="text-gray-500 text-sm">{timestamp}</div>
</div> 