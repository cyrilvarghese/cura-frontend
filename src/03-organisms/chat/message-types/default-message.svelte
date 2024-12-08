<script lang="ts">
  import { getRelativeTime } from "$lib/utils/time";
  
  let { content, sender, timestamp, isStudent } = $props<{
    content: string;
    sender: string;
    timestamp: Date;
    isStudent: boolean;
  }>();
</script>

<div class="bg-card rounded-lg p-4 shadow-sm border {isStudent ? ' bg-primary/70 text-primary-foreground' : ''}">
  <div class="flex items-center gap-2 mb-1">
    <span class="font-medium">@{sender}</span>
    <span class="text-xs {isStudent ? 'text-primary-foreground/70' : 'text-muted-foreground'}">
      {getRelativeTime(timestamp)}
    </span>
  </div>
  <p class="text-sm">{content}</p>
</div> 