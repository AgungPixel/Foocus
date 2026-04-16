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
		{ name: 'Task List', href: '/todos', icon: ListTodo },
		{ name: 'My Notes', href: '/notes', icon: NotebookPen }
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
    transition-all duration-300 ease-in-out
    {isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
    lg:translate-x-0 {isOpen ? 'lg:w-64' : 'lg:w-16'}
    bg-[#0a0a0a] border-r border-[#1a1a1a] text-[#a3a3a3]
  "
>
	<!-- Header Logo Area -->
	<div class="flex h-12 shrink-0 items-center justify-between px-5 border-b border-[#1a1a1a] overflow-hidden whitespace-nowrap">
		<a href="/" class="flex items-center" onclick={handleLinkClick}>
			<div class="flex h-6 w-6 shrink-0 items-center justify-center bg-white text-black rounded-sm">
				<span class="font-bold text-sm leading-none mt-[1px]">F</span>
			</div>
			
			<div class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}">
				<span class="overflow-hidden transition-opacity duration-300 pl-3 text-sm font-medium text-white {isOpen ? 'opacity-100' : 'opacity-0'}">
					Foocus.
				</span>
			</div>
		</a>

		<!-- Mobile close button -->
		<button
			class="text-[#a3a3a3] hover:text-white transition-colors lg:hidden shrink-0"
			onclick={() => (isOpen = false)}
			aria-label="Close sidebar"
		>
			<X size={18} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-4">
		<div class="grid transition-[grid-template-rows] duration-300 ease-in-out {isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}">
			<p class="overflow-hidden px-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#525252] transition-opacity duration-300 whitespace-nowrap {isOpen ? 'opacity-100' : 'opacity-0'}">
				Menu
			</p>
		</div>
		
		<ul class="space-y-0.5 px-3">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						use:tooltip={{ label: item.name, disabled: isOpen }}
						class="
              flex items-center rounded-md px-3 py-2 transition-all duration-200 overflow-hidden whitespace-nowrap
              {active
								? 'bg-[#1a1a1a] text-white'
								: 'text-[#a3a3a3] hover:bg-[#111] hover:text-[#d4d4d4]'}
            "
					>
						<div class="flex shrink-0 items-center justify-center w-[20px] ml-[2px]">
							<item.icon size={17} strokeWidth={active ? 2 : 1.5} />
						</div>
						
						<div class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}">
							<span class="overflow-hidden transition-opacity duration-300 pl-3 text-sm {isOpen ? 'opacity-100' : 'opacity-0'}">
								{item.name}
							</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
