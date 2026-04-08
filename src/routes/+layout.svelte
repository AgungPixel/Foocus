<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { fade } from 'svelte/transition';
	import { Menu } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
	import './layout.css';

	let { children } = $props();

	let sidebarOpen = $state(true);
	let mounted = $state(false);

	onMount(async () => {
		if (window.innerWidth < 1024) {
			sidebarOpen = false;
		}
		await tick();
		setTimeout(() => {
			mounted = true;
		}, 50); // delay before enabling CSS transitions
	});
</script>

<svelte:head>
	{#if !mounted}
		<style>
			*, *::before, *::after {
				transition: none !important;
				animation: none !important;
			}
		</style>
	{/if}
</svelte:head>

<div class="min-h-screen bg-black text-gray-300 selection:bg-gray-800">
	<Sidebar bind:isOpen={sidebarOpen} />

	<main
		class="
    transition-all duration-300 ease-in-out
    {sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
  "
	>
		<!-- Mobile Header -->
		<div
			class="sticky top-0 z-30 flex items-center border-b border-gray-800 bg-black/80 p-4 backdrop-blur-md md:hidden"
		>
			<button
				onclick={() => (sidebarOpen = true)}
				class="-ml-2 rounded p-2 text-gray-400 hover:text-white transition-colors"
				aria-label="Open menu"
			>
				<Menu size={24} />
			</button>
			<span class="ml-3 text-lg font-medium text-white">Foocus</span>
		</div>

		<div class="p-6 md:p-10" in:fade={{ duration: 300 }}>
			{@render children()}
		</div>
	</main>
</div>
