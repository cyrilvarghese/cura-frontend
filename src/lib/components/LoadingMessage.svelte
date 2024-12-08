<script lang="ts">
    let dots = $state(".");
    
    // Animate the dots
    setInterval(() => {
        dots = dots.length >= 3 ? "." : dots + ".";
    }, 500);
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border">
    <p class="text-sm text-muted-foreground">Patient is thinking{dots}</p>
</div>
