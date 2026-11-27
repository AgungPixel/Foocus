<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { Menu, RefreshCw } from 'lucide-svelte';
	import { sync } from '$lib/stores/syncStore.svelte';
	import './layout.css';

	let { children } = $props();

	let sidebarOpen = $state(browser ? window.innerWidth >= 1024 : false);
	let mounted = $state(false);

	onMount(async () => {
		sync.init();
		await tick();
		setTimeout(() => {
			mounted = true;
		}, 50);
	});

	const titles: Record<string, string> = {
		'/': 'Dashboard',
		'/notes': 'Notes',
		'/todos': 'Tasks',
		'/sync': 'Sync'
	};
	const pageTitle = $derived(
		titles[$page.url.pathname] ?? ($page.url.pathname.startsWith('/notes/') ? 'Notes' : 'Foocus')
	);

	const statusMeta = $derived.by(() => {
		switch (sync.status) {
			case 'syncing':
				return { label: 'Syncing…', color: '#CCFF00', spin: true };
			case 'synced':
				return { label: 'Synced', color: '#CCFF00', spin: false };
			case 'offline':
				return { label: 'Offline', color: '#A1A1A1', spin: false };
			case 'error':
				return { label: 'Sync error', color: '#ff6b6b', spin: false };
			default:
				return { label: 'Ready', color: '#525252', spin: false };
		}
	});
</script>

<svelte:head>
	{#if !mounted}
		<style>
			*,
			*::before,
			*::after {
				transition: none !important;
				animation: none !important;
			}
		</style>
	{/if}
</svelte:head>

<div class="min-h-screen" style="background: #000000; color: #ffffff;">
	<Sidebar bind:isOpen={sidebarOpen} />

	<div
		class="flex min-h-screen flex-col transition-all duration-300 ease-in-out {sidebarOpen
			? 'lg:ml-64'
			: 'lg:ml-16'}"
	>
		<!-- ─── Top Header ─── -->
		<header
			class="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 px-5"
			style="background: #000000; border-bottom: 1px solid #1a1a1a;"
		>
			<div class="flex items-center gap-3">
				<button
					onclick={() => (sidebarOpen = !sidebarOpen)}
					class="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/5"
					aria-label="Toggle menu"
					style="color: #A1A1A1;"
				>
					<Menu size={16} />
				</button>

				<span class="text-sm font-medium" style="color: #A1A1A1;">{pageTitle}</span>
			</div>

			{#if sync.code}
				<a
					href="/sync"
					class="flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] transition-colors hover:bg-white/5"
					style="border: 1px solid #1a1a1a; color: #A1A1A1;"
					title="Sync status"
				>
					{#if statusMeta.spin}
						<RefreshCw size={11} class="animate-spin" style="color: {statusMeta.color}" />
					{:else}
						<span class="h-1.5 w-1.5 rounded-full" style="background: {statusMeta.color}"></span>
					{/if}
					<span>{statusMeta.label}</span>
				</a>
			{/if}
		</header>

		<!-- ─── Page Content ─── -->
		<main class="flex-1 p-6 md:p-8">
			{@render children()}
		</main>
	</div>
</div>
