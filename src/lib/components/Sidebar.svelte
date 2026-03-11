<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, X, Zap } from 'lucide-svelte';

	interface Props {
		isOpen?: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();

	const menuItems = [
		{ name: 'Dashboard', href: '/', icon: House, color: 'text-blue-400', bg: 'bg-blue-500/20' },
		{ name: 'My Notes', href: '/notes', icon: NotebookPen, color: 'text-purple-400', bg: 'bg-purple-500/20' },
		{ name: 'Task List', href: '/todos', icon: ListTodo, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
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
		if (isOpen && window.innerWidth < 768) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
		}

		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
		transition:fade={{ duration: 400 }}
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
    fixed z-[60] flex flex-col
    transition-all duration-[600ms]
    ease-[cubic-bezier(0.34,1.56,0.64,1)]
    {isOpen ? 'translate-x-0 opacity-100 scale-100 rotate-0' : '-translate-x-[150%] opacity-0 scale-75 -rotate-12 pointer-events-none'} 
    w-[280px] h-screen md:h-[calc(100vh-32px)] top-0 left-0 md:top-4 md:left-4
	rounded-none md:rounded-3xl overflow-hidden
	bg-gray-900/80 backdrop-blur-2xl border border-white/10
	shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]
  "
>
	<!-- Decorative Background Gradients inside Sidebar -->
	<div class="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-purple-600/20 blur-[80px] pointer-events-none"></div>
	<div class="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none"></div>

	<!-- Header Logo Area -->
	<div class="flex h-24 shrink-0 items-center justify-between px-6 border-b border-white/5 relative z-10">
		<div class="flex items-center gap-3">
			<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/40 transform transition-transform duration-500 hover:rotate-12 hover:scale-110">
				<Zap size={24} class="text-white fill-white" />
			</div>
			
			<div class="flex flex-col justify-center">
				<span class="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
					Foocus
				</span>
				<span class="text-[10px] font-bold uppercase tracking-widest text-purple-400">Workspace</span>
			</div>
		</div>

		<button 
			class="rounded-full bg-white/5 p-2 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 hover:scale-110" 
			onclick={() => (isOpen = false)}
			aria-label="Close sidebar"
		>
			<X size={20} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-8 relative z-10 scrollbar-hide">
		<ul class="space-y-4 px-5">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						class="
              group relative flex items-center rounded-2xl px-4 py-4 transition-all duration-300 overflow-hidden
              {active
							? 'bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10 translate-x-2'
							: 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}
            "
					>
						<!-- Active Indicator -->
						{#if active}
							<div class="absolute inset-0 bg-gradient-to-r {item.bg.replace('20', '10')} to-transparent opacity-50"></div>
							<div class="absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full {item.bg.replace('/20', '')}"></div>
						{/if}

						<div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800/50 border border-white/5 transition-transform duration-300 group-hover:scale-110 {active ? item.color + ' ' + item.bg : ''}">
							<item.icon size={20} />
						</div>

						<span class="ml-4 font-semibold tracking-wide transition-colors {active ? 'text-white' : ''}">
							{item.name}
						</span>
						
						<!-- Hover Chevron -->
						<div class="absolute right-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 {active ? item.color : 'text-gray-500'}">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Action / Upgrade Banner -->
	<div class="mx-5 mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 p-5 relative z-10 overflow-hidden group">
		<div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/30 blur-2xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>
		<h4 class="text-sm font-bold text-white mb-1 relative z-10">Pro Features</h4>
		<p class="text-xs text-purple-200 mb-3 line-clamp-2 relative z-10">Unlock unlimited workspaces and custom themes.</p>
		<button class="w-full rounded-xl bg-purple-500 hover:bg-purple-400 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 relative z-10">
			Upgrade Now
		</button>
	</div>

	<!-- Footer / User Profile Area -->
	<div class="shrink-0 border-t border-white/5 p-5 relative z-10 bg-black/20">
		<div class="flex items-center rounded-2xl bg-transparent p-2 transition-all hover:bg-white/5 cursor-pointer">
			<div class="relative">
				<img src="https://ui-avatars.com/api/?name=Creator&background=random&color=fff&rounded=true" alt="User Avatar" class="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/50 p-0.5" />
				<div class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-gray-900 bg-green-500"></div>
			</div>
			<div class="ml-4 overflow-hidden">
				<p class="truncate text-sm font-bold text-white">The Creator</p>
				<p class="truncate text-xs font-medium text-purple-400">Online</p>
			</div>
		</div>
	</div>
</aside>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
