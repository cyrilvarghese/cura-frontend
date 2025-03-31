<script lang="ts">
  import SidebarLeft from "./sidebar-left.svelte";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
</script>

<Sidebar.Provider>
  <div class="flex">
    <SidebarLeft />
    <Sidebar.Inset>
      <header class="absolute bg-background top-0 flex h-14 shrink-0 items-center gap-2">
        <div class="flex flex-1 items-center gap-2 px-3">
          <Sidebar.Trigger />
          <Separator orientation="vertical" class="mr-2 h-4" />
        </div>
      </header>
      <main>
        <slot></slot>
      </main>
    </Sidebar.Inset>
  </div>
</Sidebar.Provider> 