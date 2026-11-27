<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { House, NotebookPen, ListTodo, RefreshCw, X, Info } from 'lucide-svelte';
	import { tooltip } from '$lib/actions/tooltip.js';

	interface Props {
		isOpen?: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();
	let isAboutOpen = $state(false);

	const menuItems = [
		{ name: 'Dashboard', href: '/', icon: House },
		{ name: 'Tasks', href: '/todos', icon: ListTodo },
		{ name: 'Notes', href: '/notes', icon: NotebookPen },
		{ name: 'Sync', href: '/sync', icon: RefreshCw }
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

	let isMobile = $state(false);

	$effect(() => {
		const checkMobile = () => (isMobile = window.innerWidth < 768);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	$effect(() => {
		if (isOpen && isMobile) {
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
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
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
    fixed top-0 left-0 z-50 flex h-screen flex-col
    transition-all duration-300 ease-in-out
    {isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
    lg:translate-x-0 {isOpen ? 'lg:w-64' : 'lg:w-16'}
    border-r border-[#1a1a1a] bg-[#0a0a0a] text-[#a3a3a3]
  "
>
	<!-- Header Logo Area -->
	<div
		class="flex h-12 shrink-0 items-center justify-between overflow-hidden border-b border-[#1a1a1a] px-5 whitespace-nowrap"
	>
		<a href="/" class="flex items-center" onclick={handleLinkClick}>
			<div
				class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen
					? 'grid-cols-[1fr]'
					: 'grid-cols-[0fr]'}"
			>
				<span
					class="overflow-hidden text-sm font-medium text-white transition-opacity duration-300 {isOpen
						? 'opacity-100'
						: 'opacity-0'}"
				>
					Foocus.
				</span>
			</div>
		</a>

		<!-- Mobile close button -->
		<button
			class="shrink-0 text-[#a3a3a3] transition-colors hover:text-white lg:hidden"
			onclick={() => (isOpen = false)}
			aria-label="Close sidebar"
		>
			<X size={18} strokeWidth={1.5} />
		</button>
	</div>

	<!-- Navigation Links -->
	<nav class="flex-1 overflow-x-hidden overflow-y-auto py-4">
		<div
			class="grid transition-[grid-template-rows] duration-300 ease-in-out {isOpen
				? 'grid-rows-[1fr]'
				: 'grid-rows-[0fr]'}"
		>
			<p
				class="overflow-hidden px-5 pb-2 text-[11px] font-semibold tracking-widest whitespace-nowrap text-[#525252] uppercase transition-opacity duration-300 {isOpen
					? 'opacity-100'
					: 'opacity-0'}"
			>
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
              flex items-center overflow-hidden rounded-md px-3 py-2 whitespace-nowrap transition-all duration-200
              {active
							? 'bg-[#1a1a1a] text-white'
							: 'text-[#a3a3a3] hover:bg-[#111] hover:text-[#d4d4d4]'}
            "
					>
						<div class="ml-[2px] flex w-[20px] shrink-0 items-center justify-center">
							<item.icon
								size={17}
								strokeWidth={active ? 2 : 1.5}
								style={active ? 'color: #CCFF00' : ''}
							/>
						</div>

						<div
							class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen
								? 'grid-cols-[1fr]'
								: 'grid-cols-[0fr]'}"
						>
							<span
								class="overflow-hidden pl-3 text-sm transition-opacity duration-300 {isOpen
									? 'opacity-100'
									: 'opacity-0'}"
							>
								{item.name}
							</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer About Link -->
	<div class="mt-auto px-3 pb-4">
		<button
			onclick={() => (isAboutOpen = true)}
			use:tooltip={{ label: 'About', disabled: isOpen }}
			class="flex w-full items-center overflow-hidden rounded-md px-3 py-2 whitespace-nowrap text-[#a3a3a3] transition-all duration-200 hover:bg-[#111] hover:text-[#d4d4d4]"
		>
			<div class="ml-[2px] flex w-[20px] shrink-0 items-center justify-center">
				<Info size={17} strokeWidth={1.5} />
			</div>

			<div
				class="grid transition-[grid-template-columns] duration-300 ease-in-out {isOpen
					? 'grid-cols-[1fr]'
					: 'grid-cols-[0fr]'} w-full text-left"
			>
				<span
					class="overflow-hidden pl-3 text-sm transition-opacity duration-300 {isOpen
						? 'opacity-100'
						: 'opacity-0'}"
				>
					About
				</span>
			</div>
		</button>
	</div>
</aside>

<!-- About Modal Overlay -->
{#if isAboutOpen}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		role="button"
		tabindex="0"
		onclick={() => (isAboutOpen = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') isAboutOpen = false;
		}}
	>
		<div
			class="relative w-full max-w-md rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 shadow-xl"
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<button
				class="absolute top-4 right-4 text-[#a3a3a3] transition-colors hover:text-white"
				onclick={() => (isAboutOpen = false)}
				aria-label="Close about modal"
			>
				<X size={18} strokeWidth={1.5} />
			</button>

			<div class="mb-5 flex items-center gap-3">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#CCFF00] text-black"
				>
					<span class="mt-[1px] text-lg leading-none font-bold">F</span>
				</div>
				<h3 class="text-lg font-bold text-white">About Foocus</h3>
			</div>

			<p class="text-sm leading-relaxed text-[#a3a3a3]">
				Foocus adalah ruang pribadi minimalis dan bebas distraksi untuk mengelola tugas harian serta
				catatan berbasis blok dan Markdown dalam satu tempat.
				<br /><br />
				Data tersimpan lokal di browser dan otomatis tersinkron antar perangkat secara aman menggunakan
				kode sync.
			</p>

			<div
				class="mt-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-[#1a1a1a] pt-4 text-xs"
			>
				<span class="text-[#525252]">Made by</span>
				<span class="font-medium text-white">Agung</span>
				<span class="mx-1 text-[#333]">|</span>
				<span class="text-[#525252]">Built with</span>
				<span class="font-medium text-[#a3a3a3]">SvelteKit & Tailwind</span>
			</div>
		</div>
	</div>
{/if}
