<script lang="ts">
    const { message = "Patient is thinking" } = $props<{message?: string}>();
    let dots = $state(".");

    setInterval(() => {
        dots = dots.length >= 3 ? "." : dots + ".";
    }, 500);
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border">
    <p class="text-sm font-semibold text-muted-foreground">{message}{dots}</p>
</div>
