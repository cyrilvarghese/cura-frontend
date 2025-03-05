<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Link } from "svelte-routing";

	// The `any` should be `Component` after lucide-svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { items }: { items: { title: string; url: string; icon: any }[] } =
		$props();
</script>

<Sidebar.Menu>
	{#each items as item (item.title)}
		<Sidebar.MenuItem>
			<Link to={item.url} let:active>
				<Sidebar.MenuButton isActive={active}>
					{#snippet child({ props })}
						<div {...props}>
							<item.icon />
							<span>{item.title}</span>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Link>
		</Sidebar.MenuItem>
	{/each}
</Sidebar.Menu>
