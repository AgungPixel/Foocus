<script lang="ts">
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, ChevronLeft, ChevronRight, X, Command } from 'lucide-svelte';

	interface Props {
		isOpen?: boolean;
	}

	let { isOpen = $bindable(true) }: Props = $props();

	const menuItems = [
		{ name: 'Dashboard', href: '/', icon: House },
		{ name: 'My Notes', href: '/notes', icon: NotebookPen },
		{ name: 'Task List', href: '/todos', icon: ListTodo }
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	function handleLinkClick() {
		if (window.innerWidth < 768) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.body.classList.add('overflow-hidden', 'md:overflow-auto');
		} else {
			document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
		}

		return () => {
			document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
		};
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
		transition:fade={{ duration: 300 }}
		role="button"
		tabindex="0"
		aria-label="Close sidebar"
		onclick={() => (isOpen = false)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') isOpen = false;
		}}
	></div>
{/if}

<aside
	class="
    fixed z-50 flex flex-col
    transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
    {isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
    md:translate-x-0
    {isOpen ? 'md:w-[260px]' : 'md:w-[88px]'}
	md:h-[calc(100vh-32px)] md:top-4 md:left-4
	h-screen top-0 left-0
	rounded-none md:rounded-3xl
	bg-gray-900/60 backdrop-blur-xl border border-white/10
	shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
  "
>
	<!-- Header Logo Area -->
	<div class="flex h-20 shrink-0 items-center {isOpen ? 'justify-between px-6' : 'justify-center'} transition-all duration-300 relative">
		
		<!-- Optional background glow for the logo area -->
		<div class="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none rounded-t-3xl"></div>

		<div class="flex items-center gap-3 relative z-10 transition-transform duration-300 hover:scale-105">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
				<Command size={20} class="text-white" />
			</div>
			
			<span
				class="overflow-hidden text-xl font-bold tracking-tight text-white whitespace-nowrap transition-all duration-300
				{isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}"
			>
				Foocus
			</span>
		</div>

		<button class="rounded-full p-2 hover:bg-white/10 text-gray-400 hover:text-white md:hidden transition-colors" onclick={() => (isOpen = false)}>
			<X size={20} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-6 relative z-10 scrollbar-hide">
		<ul class="space-y-3 px-4 transition-all duration-300">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						class="
              group relative flex items-center rounded-xl transition-all duration-300 overflow-hidden
              {isOpen ? 'px-4 py-3.5' : 'justify-center p-3.5 mx-auto w-14'}
              {active
							? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
							: 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}
            "
					>
						<!-- Active state background glow -->
						{#if active}
							<div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-50"></div>
							<div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
						{/if}

						<div class="relative flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 {active ? 'text-purple-400' : ''}">
							<item.icon size={22} />
						</div>

						<span
							class="overflow-hidden font-medium whitespace-nowrap transition-all duration-300 relative
              				{isOpen ? 'ml-4 w-auto opacity-100' : 'ml-0 w-0 opacity-0'}
            			"
						>
							{item.name}
						</span>

						<!-- Floating Tooltip when collapsed -->
						{#if !isOpen}
							<div
								class="
								pointer-events-none absolute left-full top-1/2 ml-6 -translate-y-1/2 
								rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white shadow-xl 
								opacity-0 translate-x-[-10px] transition-all duration-300 
								group-hover:opacity-100 group-hover:translate-x-0 hidden md:flex items-center
								border border-gray-700 whitespace-nowrap z-50
              					"
							>
								<!-- Tooltip arrow -->
								<div class="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-b border-gray-700 bg-gray-800"></div>
								<span class="relative z-10">{item.name}</span>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer / User Profile Area -->
	<div class="mt-auto shrink-0 border-t border-white/10 p-4 relative z-10">
		<div class="flex items-center rounded-xl bg-black/20 p-2 transition-colors hover:bg-black/40 cursor-pointer {isOpen ? '' : 'justify-center'}">
			<img src="https://ui-avatars.com/api/?name=Creator&background=random&color=fff" alt="User Avatar" class="h-10 w-10 rounded-lg object-cover ring-2 ring-white/10" />
			<div class="ml-3 overflow-hidden transition-all duration-300 {isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 m-0'}">
				<p class="truncate text-sm font-semibold text-white">Creator</p>
				<p class="truncate text-xs text-gray-400">Pro Plan</p>
			</div>
		</div>
	</div>

	<!-- Toggle Button (Attached to right edge) -->
	<button
		class="absolute -right-3.5 top-8 hidden h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-gray-400 border border-gray-700 shadow-lg transition-transform hover:scale-110 hover:text-white md:flex z-50"
		onclick={() => (isOpen = !isOpen)}
		aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
	>
		{#if isOpen}
			<ChevronLeft size={16} />
		{:else}
			<ChevronRight size={16} />
		{/if}
	</button>
</aside>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
