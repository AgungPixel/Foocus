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
			<span
				class="overflow-hidden text-base tracking-tight font-medium text-white whitespace-nowrap transition-all duration-300
				{isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}"
			>
				Foocus.
			</span>
		</a>

		<button class="text-[#a3a3a3] hover:text-white md:hidden transition-colors" onclick={() => (isOpen = false)}>
			<X size={20} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-6">
		{#if isOpen}
			<h4 class="px-6 mb-3 text-xs font-semibold uppercase tracking-wider text-[#525252] transition-opacity duration-300">Menu</h4>
		{/if}
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

						<span
							class="overflow-hidden text-sm whitespace-nowrap transition-all duration-300
              				{isOpen ? 'ml-3 w-auto opacity-100' : 'ml-0 w-0 opacity-0 hidden'}
            			"
						>
							{item.name}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer Toggle Button -->
	<div class="mt-auto shrink-0 border-t border-[#262626] p-4 flex {isOpen ? 'justify-end' : 'justify-center'}">
		<button
			class="hidden items-center justify-center rounded-md p-2 text-[#a3a3a3] transition-colors hover:bg-[#171717] hover:text-white md:flex"
			onclick={() => (isOpen = !isOpen)}
			aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
		>
			{#if isOpen}
				<div class="flex items-center gap-2 text-xs font-medium">
					Collapse <PanelLeftClose size={16} strokeWidth={1.5} />
				</div>
			{:else}
				<PanelLeftOpen size={18} strokeWidth={1.5} />
			{/if}
		</button>
	</div>
</aside>

