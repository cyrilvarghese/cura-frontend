<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	let restProps: SonnerProps = $props();
</script>

<Sonner
	theme={$mode}
	class="toaster sonner-toaster"
	toastOptions={{
		classes: {
			toast: "sonner-toast group-[.sonner-toaster]:bg-background group-[.sonner-toaster]:text-foreground group-[.sonner-toaster]:border-border group-[.sonner-toaster]:shadow-lg",
			description: "group-[.sonner-toast]:text-muted-foreground",
			actionButton: "group-[.sonner-toast]:bg-primary group-[.sonner-toast]:text-primary-foreground",
			cancelButton: "group-[.sonner-toast]:bg-muted group-[.sonner-toast]:text-muted-foreground",
		},
	}}
	{...restProps}
/>
