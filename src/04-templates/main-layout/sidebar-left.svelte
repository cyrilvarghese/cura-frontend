<script lang="ts">
	import {
		Feather,
		Stethoscope,
		Microscope,
		Wrench,
		BookOpen,
		GraduationCap,
		Library,
		Stethoscope as OSCE,
		Target,
		PenTool,
		MessageSquare,
		BookOpen as Study,
		Users,
		MessageCircleQuestion,
		Settings2,
		Calendar,
		LogOut,
	} from "lucide-svelte";
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import TeamSwitcher from "./team-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { authStore } from "$lib/stores/authStore";
	import { navigate } from "svelte-routing";

	async function handleLogout() {
		console.log("Logging out");
		try {
			await authStore.logout();
			navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}

	const data = $state({
		teams: [
			{
				name: "Dermatology",
				logo: Feather,
				plan: "Enterprise",
			},
			{
				name: "Internal Medicine",
				logo: Stethoscope,
				plan: "Startup",
			},
			{
				name: "Microbiology",
				logo: Microscope,
				plan: "Free",
			},
		],
		navMain: [
			{
				title: "Curriculum",
				url: "/curriculum",
				icon: BookOpen,
				isActive: true,
			},
			{
				title: "Case Library",
				url: "/case-library",
				icon: Library,
			},
			{
				title: "Class",
				url: "/class",
				icon: GraduationCap,
			},
			
		
			{
				title: "OSCE/OSPE",
				url: "/osce",
				icon: OSCE,
			},
			{
				title: "Spotter Tests",
				url: "/spotter-tests",
				icon: Target,
			},
			{
				title: "Written Questions",
				url: "/written-questions",
				icon: PenTool,
			},
			{
				title: "Viva Questions",
				url: "/viva-questions",
				icon: MessageSquare,
			},
			{
				title: "Study Material",
				url: "/study-material",
				icon: Study,
			},
			{
				title: "Forum",
				url: "/forum",
				icon: Users,
			},
			{
				title: "Knowledge Base",
				url: "/knowledge-base",
				icon: BookOpen,
			},
			{
				title: "Tools",
				url: "/tools/case-data-creator",
				icon: Wrench,
			}
		],
		navSecondary: [
			{
				title: "Calendar",
				url: "#",
				icon: Calendar,
			},
			{
				title: "Settings",
				url: "#",
				icon: Settings2,
			},
			{
				title: "Help",
				url: "#",
				icon: MessageCircleQuestion,
			},
			{
				title: "Logout",
				url: "#",
				icon: LogOut,
				onClick: handleLogout,
			},
		],
	});

	let {
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root class="border-r-0" {...restProps}>
	<Sidebar.Header>
		<TeamSwitcher teams={data.teams} />
		<NavMain items={data.navMain} />
	</Sidebar.Header>
	<Sidebar.Content>
		 
			<NavSecondary items={data.navSecondary} class="mt-auto pb-10" />

		 
	</Sidebar.Content >
	<Sidebar.Rail />
</Sidebar.Root>
