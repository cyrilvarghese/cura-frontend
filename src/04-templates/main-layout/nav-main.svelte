<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Link } from "svelte-routing";
	import { authStore } from "$lib/stores/authStore";
	import type { AuthState } from "$lib/stores/authStore";
	// The `any` should be `Component` after lucide-svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let {
		items,
	}: { items: { title: string; url: string; icon: any; role?: string[] }[] } =
		$props();

	let user: AuthState["user"] | undefined = $state();
	authStore.subscribe((state) => {
		user = state.user;
		if (user) {
			console.log("Current user role:", user.role);
		}
	});
</script>

<Sidebar.Menu>
	{#each items as item (item.title)}
		{#if !item.role || (item.role && user?.role && item.role.includes(user.role))}
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
		{/if}
	{/each}
</Sidebar.Menu>
