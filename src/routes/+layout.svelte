<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { fade } from 'svelte/transition';
	import { Menu } from '@lucide/svelte'; // Butuh icon menu untuk mobile trigger
	import './layout.css'; // Pastikan path css benar (biasanya app.css atau layout.css)

	// Svelte 5: Ambil 'children' dari props untuk menggantikan <slot />
	let { children } = $props();

	let sidebarOpen = $state(false);
</script>

<div class="min-h-screen">
	<Sidebar bind:isOpen={sidebarOpen} />

	<main
		class="
    transition-all duration-300 ease-in-out
    {sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
  "
	>
		<div
			class="sticky top-0 z-30 flex items-center border-b p-4 backdrop-blur-sm md:hidden"
		>
			<button
				onclick={() => (sidebarOpen = true)}
				class="-ml-2 rounded-lg p-2 transition-colors"
				aria-label="Open menu"
			>
				<Menu size={24} />
			</button>
			<span class="ml-3 text-lg font-semibold">Foocus</span>
		</div>

		<div class="p-4 md:p-8" in:fade={{ duration: 300 }}>
			{@render children()}
		</div>
	</main>
</div>
