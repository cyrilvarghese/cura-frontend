<script lang="ts">
	import SidebarLeft from "./sidebar-left.svelte";
	import SidebarRight from "./sidebar-right.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Slash } from "lucide-svelte";
	import { Route, Router } from "svelte-routing";
	import HomePage from "../../05-pages/home/home-page.svelte";
	import CasePlayer from "../../05-pages/cases/case-player.svelte"; // Importing the CasePlayer component
</script>

<Sidebar.Provider>
	<SidebarLeft />
	<Sidebar.Inset>
		<header
			class="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2"
		>
			<div class="flex flex-1 items-center gap-2 px-3">
				<Sidebar.Trigger />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/">Cases</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/cases"
								>Diagnosis</Breadcrumb.Link
							>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/cases"
								>Urticarial Vasculitis</Breadcrumb.Link
							>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<main>
			<Router url="">
				<Route path="/">
					<HomePage />
				</Route>
					
				<Route path="cases/:id" let:params>
					<CasePlayer id={params.id} message={undefined} />
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
