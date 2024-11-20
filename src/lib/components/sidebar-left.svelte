<script lang="ts">
	import AudioWaveform from "lucide-svelte/icons/audio-waveform";
	import Blocks from "lucide-svelte/icons/blocks";
	import Calendar from "lucide-svelte/icons/calendar";
	import Command from "lucide-svelte/icons/command";
	import House from "lucide-svelte/icons/house";
	import Inbox from "lucide-svelte/icons/inbox";
	import MessageCircleQuestion from "lucide-svelte/icons/message-circle-question";
	import Search from "lucide-svelte/icons/search";
	import Settings2 from "lucide-svelte/icons/settings-2";
	import Sparkles from "lucide-svelte/icons/sparkles";
	import Trash2 from "lucide-svelte/icons/trash-2";
	import { Feather, Stethoscope, Microscope } from "lucide-svelte";

	import NavFavorites from "$lib/components/nav-favorites.svelte";
	import NavMain from "$lib/components/nav-main.svelte";
	import NavSecondary from "$lib/components/nav-secondary.svelte";
	import NavWorkspaces from "$lib/components/nav-workspaces.svelte";
	import TeamSwitcher from "$lib/components/team-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";

	// This is sample data.
	const data = {
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
				title: "Search",
				url: "#",
				icon: Search,
			},
			{
				title: "Ask AI",
				url: "#",
				icon: Sparkles,
			},
			{
				title: "Home",
				url: "#",
				icon: House,
				isActive: true,
			},
			{
				title: "Inbox",
				url: "#",
				icon: Inbox,
				badge: "10",
			},
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
				title: "Templates",
				url: "#",
				icon: Blocks,
			},
			{
				title: "Trash",
				url: "#",
				icon: Trash2,
			},
			{
				title: "Help",
				url: "#",
				icon: MessageCircleQuestion,
			},
		],
		favorites: [
			{
				name: "Shortness of Breath in a Middle-Aged Woman",
				url: "#",
				emoji: "📄",
			},
			{
				name: "Abdominal Pain in an Elderly Man",
				url: "#",
				emoji: "📄",
			},
			{
				name: "Headache and Vision Changes in a Young Adult",
				url: "#",
				emoji: "📄",
			},
		],
		workspaces: [
			{
				name: "Diagnosis",
				emoji: "🔍",
				pages: [
					{
						name: "Urticarial Vasculitis",
						url: "/cases/urticarial-vasculitis",
						emoji: "📋",
					},
					{
						name: "Eczema (Atopic Dermatitis)",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Medication",
						url: "#",
						emoji: "📋",
					},
				],
			},
			{
				name: "Treatment and Management",
				emoji: "💊",
				pages: [
					{
						name: "Moderate Plaque Psoriasis",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Contact Dermatitis",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Seborrheic Dermatosis",
						url: "#",
						emoji: "📋",
					},
				],
			},
			{
				name: "Pathophysiology",
				emoji: "🔬",
				pages: [
					{
						name: "Psoriasis",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Atopic Dermatitis",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Basal Cell Carcinoma",
						url: "#",
						emoji: "📋",
					},
				],
			},
			{
				name: "Prevention and Health Promotion",
				emoji: "🛡️",
				pages: [
					{
						name: "Skin Cancer Prevention",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Pressure Ulcers",
						url: "#",
						emoji: "📋",
					},
				],
			},
			{
				name: "Diagnostic Procedures",
				emoji: "🔎",
				pages: [
					{
						name: "Pigmented lesion management",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Scalp rash diagnosis",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Non-healing ulcer assessment",
						url: "#",
						emoji: "📋",
					},
				],
			},
			{
				name: "Epidemiology and Public Health",
				emoji: "📊",
				pages: [
					{
						name: "Melanoma risk factors",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Skin cancer types in US",
						url: "#",
						emoji: "📋",
					},
					{
						name: "Population pressure ulcer risk",
						url: "#",
						emoji: "📋",
					},
				],
			},
		],
	};

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
		<NavFavorites favorites={data.favorites} />
		<NavWorkspaces workspaces={data.workspaces} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
