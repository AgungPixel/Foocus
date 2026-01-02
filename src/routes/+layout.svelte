<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { fade } from 'svelte/transition';
	import { Menu } from '@lucide/svelte'; // Butuh icon menu untuk mobile trigger
	import './layout.css'; // Pastikan path css benar (biasanya app.css atau layout.css)

	// Svelte 5: Ambil 'children' dari props untuk menggantikan <slot />
	let { children } = $props();

	let sidebarOpen = $state(true);
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
	<Sidebar bind:isOpen={sidebarOpen} />

	<main
		class="
    transition-all duration-300 ease-in-out
    {sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
  "
	>
		<div
			class="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white/80 p-4 backdrop-blur-sm md:hidden dark:border-gray-800 dark:bg-black/80"
		>
			<button
				onclick={() => (sidebarOpen = true)}
				class="-ml-2 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
				aria-label="Open menu"
			>
				<Menu size={24} />
			</button>
			<span class="ml-3 text-lg font-semibold">AgungPixel</span>
		</div>

		<div class="p-4 md:p-8" in:fade={{ duration: 300 }}>
			{@render children()}
		</div>
	</main>
</div>
