<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, X } from 'lucide-svelte';
	import { tooltip } from '$lib/actions/tooltip.js';

	interface Props {
		isOpen?: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();

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
		if (window.innerWidth < 1024) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
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
		class="fixed inset-0 z-40 bg-black/80 md:hidden"
		transition:fade={{ duration: 150 }}
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
    fixed z-50 flex h-screen flex-col top-0 left-0
    w-64 transition-all duration-300 ease-in-out
    {isOpen ? 'translate-x-0' : '-translate-x-full'}
    bg-[#0a0a0a] border-r border-[#1a1a1a] text-[#a3a3a3]
  "
>
	<!-- Header Logo Area -->
	<div class="flex h-12 shrink-0 items-center justify-between px-5 border-b border-[#1a1a1a]">
		<a href="/" class="flex items-center gap-3" onclick={handleLinkClick}>
			<div class="flex h-6 w-6 shrink-0 items-center justify-center bg-white text-black rounded-sm">
				<span class="font-bold text-sm leading-none">F</span>
			</div>
			<span class="text-sm font-medium text-white">Foocus.</span>
		</a>

		<!-- Mobile close button -->
		<button
			class="text-[#a3a3a3] hover:text-white transition-colors md:hidden"
			onclick={() => (isOpen = false)}
			aria-label="Close sidebar"
		>
			<X size={18} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-y-auto py-4">
		<p class="px-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#525252]">Menu</p>
		<ul class="space-y-0.5 px-3">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						use:tooltip={{ label: item.name, disabled: true }}
						class="
              flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200
              {active
								? 'bg-[#1a1a1a] text-white'
								: 'text-[#a3a3a3] hover:bg-[#111] hover:text-[#d4d4d4]'}
            "
					>
						<item.icon size={17} strokeWidth={active ? 2 : 1.5} />
						{item.name}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
