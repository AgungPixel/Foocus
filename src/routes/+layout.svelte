<script>
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { fade, scale } from 'svelte/transition';
	import { Menu } from 'lucide-svelte';
	import './layout.css';

	let { children } = $props();

	// Sidebar is now closed by default so users see the cool floating button
	let sidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
	<Sidebar bind:isOpen={sidebarOpen} />

	<!-- Floating Toggle Button (Appears when Sidebar is Closed) -->
	{#if !sidebarOpen}
		<button
			class="fixed top-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] group"
			transition:scale={{ duration: 500, start: 0.5, opacity: 0 }}
			onclick={() => (sidebarOpen = true)}
			aria-label="Open menu"
		>
			<div class="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<Menu size={24} class="text-white relative z-10 group-hover:text-purple-300 transition-colors" />
			
			<!-- Pulse effect -->
			<div class="absolute inset-0 rounded-full border border-purple-500/50 animate-ping opacity-20"></div>
		</button>
	{/if}

	<main
		class="
    transition-all duration-[600ms] cubic-bezier(0.34, 1.56, 0.64, 1) min-h-screen
    {sidebarOpen ? 'md:ml-[310px] md:scale-100 filter md:blur-none pointer-events-none md:pointer-events-auto opacity-40 md:opacity-100' : 'ml-0 transform-none'}
  "
	>
		<!-- Mobile Header placeholder to match button spacing (only visible when not sidebarOpen) -->
		{#if !sidebarOpen}
			<div class="h-24 w-full md:hidden"></div>
		{/if}

		<div class="p-6 md:p-10 pt-24 md:pt-10 transition-all duration-500" in:fade={{ duration: 400 }}>
			{@render children()}
		</div>
	</main>
</div>
