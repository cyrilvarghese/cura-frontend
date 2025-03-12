<script lang="ts">
	import SidebarLeft from "./sidebar-left.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Route, Router } from "svelte-routing";
	import CasePlayer from "../../05-pages/cases/case-player.svelte";
	import CaseCreatorWrapper from "../../05-pages/cases/case-creator-wrapper.svelte";
	import CaseAssessment from "../../05-pages/cases/case assessment/case-assessment.svelte";
	import { fetchCases } from "$lib/stores/casePlayerStore";
	import { onMount } from "svelte";
	import CurriculumPage from "../../05-pages/CurriculumPage.svelte";
	import CaseLibraryPage from "../../05-pages/CaseLibraryPage.svelte";

	// Get the current URL for Router
	export let url = "";

	onMount(() => {
		fetchCases();
	});
</script>

<Router {url}>
	<Sidebar.Provider>
		<div class="flex">
			<SidebarLeft />
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
					<Route path="/">
						<CaseCreatorWrapper />
					</Route>
					<Route path="/tools/case-data-creator">
						<CaseCreatorWrapper />
					</Route>
					<Route path="/curriculum" component={CurriculumPage} />
					<Route path="/curriculum/:id/new-case-assessment" component={CaseAssessment} />
					<Route path="/case-library" component={CaseLibraryPage} />
					<Route path="/case-library/:id" let:params>
						<CasePlayer id={params.id} />
					</Route>
				</main>
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</Router>
