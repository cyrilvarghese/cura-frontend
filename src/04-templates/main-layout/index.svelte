<script lang="ts">
	import SidebarLeft from "./sidebar-left.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Route, Router, useLocation, navigate } from "svelte-routing";
	import CasePlayer from "../../05-pages/cases/case-player.svelte";
	import CaseCreatorWrapper from "../../05-pages/cases/case-creator-wrapper.svelte";
	import { fetchCases } from "$lib/stores/casePlayerStore";
	import { onMount } from "svelte";
	import CurriculumPage from "../../05-pages/CurriculumPage.svelte";
	import CaseLibraryPage from "../../05-pages/CaseLibrary.svelte";
	import CaseAssessment from "../../05-pages/cases/case-assessment/create-case-wrapper.svelte";
	import Login from "../../05-pages/auth/Login.svelte";
	import Signup from "../../05-pages/auth/Signup.svelte";
	import { isAuthenticated } from "$lib/stores/authStore";

	// Get the current URL for Router
	export let url = "";

	const location = useLocation();
	$: isAuthRoute =
		typeof window !== "undefined" &&
		(window.location.pathname.includes("login") ||
			window.location.pathname.includes("signup"));

	onMount(() => {
		fetchCases();
	});

	$: if (!$isAuthenticated) {
		navigate("/login", { replace: true });
	}
</script>

<Router {url}>
	{#if $isAuthenticated}
		<Sidebar.Provider>
			<div class="flex">
				<SidebarLeft />
				<Sidebar.Inset>
					<header
						class="absolute bg-background top-0 flex h-14 shrink-0 items-center gap-2"
					>
						<div class="flex flex-1 items-center gap-2 px-3">
							<Sidebar.Trigger />
							<Separator
								orientation="vertical"
								class="mr-2 h-4"
							/>
						</div>
					</header>
					<main>
						<Route path="/">
							<CaseCreatorWrapper />
						</Route>
						<Route path="/tools/case-data-creator">
							<CaseCreatorWrapper />
						</Route>
						<Route path="/curriculum">
							<CurriculumPage />
						</Route>
						<Route path="/case-library">
							<CaseLibraryPage />
						</Route>
						<Route path="/case-library/:id" let:params>
							<CasePlayer id={params.id} />
						</Route>
						<Route
							path="/curriculum/:topic/:code/new-case"
							let:params
						>
							<CaseAssessment
								topic={params.topic}
								code={params.code}
							/>
						</Route>
					</main>
				</Sidebar.Inset>
			</div>
		</Sidebar.Provider>
	{:else}
		<main>
			<Route path="/login">
				<Login />
			</Route>
			<Route path="/signup">
				<Signup />
			</Route>
			<Route path="*">
				<Login />
			</Route>
		</main>
	{/if}
</Router>
