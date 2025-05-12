<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import Plus from "lucide-svelte/icons/plus";
	import { currentDepartment } from "$lib/stores/teamStore";

	let {
		teams,
	}: {
		teams: {
			name: string;
			id: string;
			// The `any` should be `Component` after lucide-svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			logo: any;
			value: string;
		}[];
	} = $props();

	// Initialize the store with the first team
	let activeDepartment = $state($currentDepartment || teams[0]);

	$effect(() => {
		currentDepartment.set(activeDepartment);
	});

	function handleTeamChange(team: (typeof teams)[0]) {
		activeDepartment = team;
		currentDepartment.set(team);
		console.log("Team changed:", team);
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton {...props} class="w-fit px-1.5">
						<div
							class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md"
						>
							<activeDepartment.logo class="size-3" />
						</div>
						<span class="truncate font-semibold"
							>{activeDepartment.name}</span
						>
						<ChevronDown class="opacity-50" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-64 rounded-lg"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-muted-foreground text-xs"
					>Teams</DropdownMenu.Label
				>
				{#each teams as team, index (team.name)}
					<DropdownMenu.Item
						onSelect={() => handleTeamChange(team)}
						class="gap-2 p-2"
					>
						<div
							class="flex size-6 items-center justify-center rounded-sm border"
						>
							<team.logo class="size-4 shrink-0" />
						</div>
						{team.name}
						<DropdownMenu.Shortcut
							>⌘{index + 1}</DropdownMenu.Shortcut
						>
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="gap-2 p-2">
					<div
						class="bg-background flex size-6 items-center justify-center rounded-md border"
					>
						<Plus class="size-4" />
					</div>
					<div class="text-muted-foreground font-medium">
						Add team
					</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
