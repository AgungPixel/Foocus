<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, PanelLeftClose, PanelLeftOpen, X } from 'lucide-svelte';

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
    fixed z-50 flex flex-col
    transition-all duration-300 ease-in-out
    {isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
    md:translate-x-0
    {isOpen ? 'md:w-64' : 'md:w-20'}
	h-screen top-0 left-0
	bg-[#0a0a0a] border-r border-[#262626] text-[#a3a3a3]
  "
>
	<!-- Header Logo Area -->
	<div class="flex h-16 shrink-0 items-center {isOpen ? 'justify-between px-6' : 'justify-center'} border-b border-[#262626] transition-all duration-300">
		<a href="/" class="flex items-center gap-2" onclick={handleLinkClick}>
			<div class="flex h-6 w-6 shrink-0 items-center justify-center bg-white text-black rounded-sm">
				<span class="font-bold text-sm leading-none mt-[1px]">F</span>
			</div>
			
			<div class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}">
				<span
					class="overflow-hidden text-base tracking-tight font-medium text-white whitespace-nowrap transition-opacity duration-300
					{isOpen ? 'opacity-100' : 'opacity-0'}"
				>
					Foocus.
				</span>
			</div>
		</a>

		<button class="text-[#a3a3a3] hover:text-white md:hidden transition-colors" onclick={() => (isOpen = false)}>
			<X size={20} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-6">
		<div class="grid transition-[grid-template-rows] duration-300 ease-in-out {isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}">
			<h4 class="overflow-hidden px-6 text-xs font-semibold uppercase tracking-wider text-[#525252]">
				<span class="block pb-3 transition-opacity duration-300 {isOpen ? 'opacity-100' : 'opacity-0'}">Menu</span>
			</h4>
		</div>
		<ul class="space-y-1 {isOpen ? 'px-3' : 'px-2'} transition-all duration-300">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						class="
              group flex items-center rounded-md transition-colors duration-200
              {isOpen ? 'px-3 py-2' : 'justify-center p-3'}
              {active
							? 'bg-[#262626] text-white'
							: 'text-[#a3a3a3] hover:bg-[#171717] hover:text-[#d4d4d4]'}
            "
					>
						<div class="flex shrink-0 items-center justify-center">
							<item.icon size={18} strokeWidth={active ? 2 : 1.5} />
						</div>

						<div class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}">
							<span
								class="overflow-hidden text-sm whitespace-nowrap transition-opacity duration-300
								{isOpen ? 'ml-3 opacity-100' : 'ml-0 opacity-0'}
            				"
							>
								{item.name}
							</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer Toggle Button -->
	<div class="mt-auto border-t border-[#262626] p-4 flex {isOpen ? 'justify-end' : 'justify-center'} overflow-hidden">
		<button
			class="hidden items-center justify-center rounded-md p-2 text-[#a3a3a3] transition-colors hover:bg-[#171717] hover:text-white md:flex whitespace-nowrap"
			onclick={() => (isOpen = !isOpen)}
			aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
		>
			<div class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'}">
				<div class="overflow-hidden flex items-center gap-2 text-xs font-medium transition-opacity duration-300 {isOpen ? 'opacity-100 pr-2' : 'opacity-0'}">
					Collapse
				</div>
			</div>
			
			{#if isOpen}
				<PanelLeftClose size={16} strokeWidth={1.5} class="shrink-0" />
			{:else}
				<PanelLeftOpen size={18} strokeWidth={1.5} class="shrink-0" />
			{/if}
		</button>
	</div>
</aside>

