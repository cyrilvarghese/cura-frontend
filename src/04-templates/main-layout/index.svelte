<script lang="ts">
	import SidebarLeft from "./sidebar-left.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Route, Router } from "svelte-routing";
	import CasePlayer from "../../05-pages/cases/case-player.svelte"; // Importing the CasePlayer component
	import CaseCreatorWrapper from "../../05-pages/cases/case-creator-wrapper.svelte";
	import { fetchCases } from "$lib/stores/casePlayerStore";
	import { onMount } from "svelte";
	onMount(() => {
		fetchCases();
	});
</script>

<Sidebar.Provider>
	<SidebarLeft   />
	<Sidebar.Inset>
		<header
			class="absolute bg-background top-0 flex h-14 shrink-0 items-center gap-2"
		>
			<div class="flex flex-1 items-center gap-2 px-3">
				<Sidebar.Trigger />
				<Separator orientation="vertical" class="mr-2 h-4" />
			</div>
		</header>
		<main>
			<Router url="">
				<Route path="/">
					<CaseCreatorWrapper />
				</Route>
				<Route path="/tools/case-data-creator">
					<CaseCreatorWrapper />
				</Route>

				<Route path="cases/:id" let:params>
					<CasePlayer id={params.id} />
				</Route>

				<!-- <Route path="posts/:id" let:params>
					<AddPost id={params.id} />
				</Route>
				<Route path="files" component={FileList} />
				<Route path="settings" component={SettingsPage} />
				<Route path="calendar" component={CalendarPage} />  -->
			</Router>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
