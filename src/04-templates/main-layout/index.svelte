<script lang="ts">
	import SidebarLeft from "./sidebar-left.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Route, Router, useLocation, navigate } from "svelte-routing";
	import CasePlayer from "../../05-pages/cases/case-player.svelte";
	import CurriculumPage from "../../05-pages/CurriculumPage.svelte";
	import CaseLibraryPage from "../../05-pages/CaseLibrary.svelte";
	import CaseAssessment from "../../05-pages/cases/case-assessment/create-case-wrapper.svelte";
	import Login from "../../05-pages/auth/Login.svelte";
	import Signup from "../../05-pages/auth/Signup.svelte";
	import PartnerSignup from "../../05-pages/auth/PartnerSignup.svelte";
	import { isAuthenticated } from "$lib/stores/authStore";
	import ClassPage from "../../05-pages/ClassPage.svelte";
	import OSCEPage from "../../05-pages/OSCEPage.svelte";
	import SpotterTestsPage from "../../05-pages/SpotterTestsPage.svelte";
	import WrittenQuestionsPage from "../../05-pages/WrittenQuestionsPage.svelte";
	import StudyMaterialPage from "../../05-pages/StudyMaterialPage.svelte";
	import ForumPage from "../../05-pages/ForumPage.svelte";
	import KnowledgeBasePage from "../../05-pages/KnowledgeBasePage.svelte";
	import VivaQuestionsPage from "../../05-pages/VivaQuestionsPage.svelte";
	import MasterDocReview from "../../05-pages/MasterDocReview.svelte";
	import { Toaster } from "svelte-sonner";
	import CaseEditPage from "../../05-pages/cases/case-edit.svelte";
	import StudentDashboardPage from "../../05-pages/StudentDashboardPage.svelte";
	import StudentPerformance from "../../05-pages/StudentPerformance.svelte";
	import ClassPerformance from "../../05-pages/ClassPerformance.svelte";

	// Get the current URL for Router
	const { url = "" } = $props<{ url?: string }>();

	const location = useLocation();
	const currentPath = $derived($location.pathname);

	$effect(() => {
		if (
			!$isAuthenticated &&
			currentPath !== "/login" &&
			!currentPath.startsWith("/signup")
		) {
			console.log("Not authenticated, redirecting to login");
			navigate("/login", { replace: true });
		}
	});
</script>

<Toaster position="top-center" />
<Router {url}>
	{#if $isAuthenticated}
		<Sidebar.Provider>
			<div class="flex">
				<SidebarLeft />
				<Sidebar.Inset>
					<header
						class="absolute bg-transparent top-0 flex h-14 shrink-0 items-center gap-2"
					>
						<div class="flex flex-1 items-center gap-2 px-2">
							<Sidebar.Trigger />
							<Separator
								orientation="vertical"
								class="mr-2 h-4"
							/>
						</div>
					</header>
					<main>
						<Route path="/">
							<!-- <StudentDashboardPage /> -->
							<CaseLibraryPage />
						</Route>

						<Route path="/curriculum">
							<CurriculumPage />
						</Route>
						<Route path="/case-library">
							<CaseLibraryPage />
						</Route>
						<Route path="/master-document-review">
							<MasterDocReview />
						</Route>
						<Route path="/case-library/:id" let:params>
							<CasePlayer id={params.id} />
						</Route>
						<Route path="/case-library/edit">
							<CaseEditPage />
						</Route>
						<Route path="/curriculum/new-case">
							<CaseAssessment />
						</Route>
						<!-- <Route path="/class">
							<ClassPage />
						</Route> -->
						<Route path="/osce">
							<OSCEPage />
						</Route>
						<Route path="/spotter-tests">
							<SpotterTestsPage />
						</Route>
						<Route path="/written-questions">
							<WrittenQuestionsPage />
						</Route>
						<Route path="/study-material">
							<StudyMaterialPage />
						</Route>
						<Route path="/forum">
							<ForumPage />
						</Route>
						<Route path="/knowledge-base">
							<KnowledgeBasePage />
						</Route>
						<Route path="/viva-questions">
							<VivaQuestionsPage />
						</Route>
						<Route path="/student-performance">
							<StudentPerformance />
						</Route>
						<Route path="/class">
							<ClassPerformance />
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
			<Route path="/partner-signup">
				<PartnerSignup />
			</Route>
			<Route path="*">
				<Login />
			</Route>
		</main>
	{/if}
</Router>
