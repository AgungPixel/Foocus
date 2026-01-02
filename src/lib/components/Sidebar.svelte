<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, ChevronLeft, ChevronRight, X } from '@lucide/svelte';

	interface Props {
		isOpen?: boolean;
		isMobile?: boolean; // Opsional, jika kamu mau pass dari parent
	}

	let { isOpen = $bindable(true), isMobile = false }: Props = $props();

	const menuItems = [
		{ name: 'Home', href: '/', icon: House },
		{ name: 'Notes', href: '/notes', icon: NotebookPen },
		{ name: 'To-Do List', href: '/todos', icon: ListTodo }
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	// --- PERBAIKAN 1: Auto Close di Mobile ---
	function handleLinkClick() {
		// Cek lebar layar. Jika < 768px (md), berarti mobile.
		if (window.innerWidth < 768) {
			isOpen = false;
		}
	}

	// ... import lainnya

	// Tambahkan logika ini
	$effect(() => {
		if (isOpen) {
			// Saat sidebar terbuka: Kunci scroll di mobile (overflow-hidden), tapi biarkan di desktop (md:overflow-auto)
			document.body.classList.add('overflow-hidden', 'md:overflow-auto');
		} else {
			// Saat sidebar tertutup: Hapus class tersebut
			document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
		}

		// Cleanup function: Dijalankan saat component di-destroy atau state berubah
		return () => {
			document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
		};
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
		transition:fade={{ duration: 200 }}
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
    fixed top-0 left-0 z-50 flex h-screen flex-col
    border-r border-gray-800 bg-black
    text-white transition-all duration-300 ease-in-out
    {isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
    md:translate-x-0
    {isOpen ? 'md:w-64' : 'md:w-20'}
  "
>
	<div class="flex h-16 items-center justify-between border-b border-gray-800 px-4">
		<span
			class="overflow-hidden text-xl font-bold whitespace-nowrap transition-all duration-300
      {isOpen ? 'w-auto opacity-100' : 'md:w-0 md:opacity-0'}"
		>
			Foocus
		</span>

		<button
			class="hidden rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white md:flex"
			onclick={() => (isOpen = !isOpen)}
			aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
		>
			{#if isOpen}
				<ChevronLeft size={20} />
			{:else}
				<ChevronRight size={20} />
			{/if}
		</button>

		<button class="rounded p-1 hover:bg-gray-800 md:hidden" onclick={() => (isOpen = false)}>
			<X size={20} />
		</button>
	</div>

	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-4">
		<ul class="space-y-2 px-2">
			{#each menuItems as item}
				{@const active = isActive(item.href)}
				<li>
					<a
						href={item.href}
						onclick={handleLinkClick}
						class="
              group relative flex items-center rounded-lg px-3 py-3 transition-all duration-200
              {active
							? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
							: 'text-gray-400 hover:bg-gray-900 hover:text-white'}
            "
					>
						<div class="flex h-6 w-6 shrink-0 items-center justify-center">
							<item.icon size={22} />
						</div>

						<span
							class="ml-3 overflow-hidden font-medium whitespace-nowrap transition-all duration-300
              {isOpen ? 'w-auto opacity-100' : 'md:ml-0 md:w-0 md:opacity-0'}
            "
						>
							{item.name}
						</span>

						{#if !isOpen}
							<div
								class="
                pointer-events-none absolute top-1/2 left-full z-50 ml-4 hidden
                -translate-y-1/2 rounded border border-gray-700 bg-gray-800 px-2
                py-1 text-xs
                whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block
              "
							>
								{item.name}
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
