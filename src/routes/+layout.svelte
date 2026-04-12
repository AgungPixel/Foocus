<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { Menu } from 'lucide-svelte';
	import './layout.css';

	let { children } = $props();

	let sidebarOpen = $state(browser ? window.innerWidth >= 1024 : false);
	let mounted = $state(false);

	onMount(async () => {
		await tick();
		setTimeout(() => { mounted = true; }, 50);
	});

	// Page title map
	const titles: Record<string, string> = {
		'/': 'Dashboard',
		'/notes': 'Notes',
		'/todos': 'Tasks',
	};
	const pageTitle = $derived(titles[$page.url.pathname] ?? 'Foocus');
</script>

<svelte:head>
	{#if !mounted}
		<style>*, *::before, *::after { transition: none !important; animation: none !important; }</style>
	{/if}
</svelte:head>

<div class="min-h-screen" style="background: #000000; color: #ffffff;">
	<Sidebar bind:isOpen={sidebarOpen} />

	<div
		class="flex min-h-screen flex-col transition-all duration-300 ease-in-out
			{sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}"
	>
		<!-- ─── Top Header ─── -->
		<header
			class="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 px-5"
			style="background: #000000; border-bottom: 1px solid #1a1a1a;"
		>
			<!-- Hamburger — always visible -->
			<button
				onclick={() => (sidebarOpen = !sidebarOpen)}
				class="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/5"
				aria-label="Toggle menu"
				style="color: #A1A1A1;"
			>
				<Menu size={16} />
			</button>

			<!-- Page title / breadcrumb -->
			<span class="text-sm font-medium" style="color: #A1A1A1;">{pageTitle}</span>
		</header>

		<!-- ─── Page Content ─── -->
		<main class="flex-1 p-6 md:p-8">
			{@render children()}
		</main>
	</div>
</div>
