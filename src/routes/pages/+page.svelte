<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { FileText, Plus, Trash2 } from 'lucide-svelte';
	import { pagesStore } from '$lib/stores/pagesStore.svelte';

	const topLevel = $derived(pagesStore.childrenOf(null));

	function createPage() {
		const id = pagesStore.addPage(null);
		goto(`/pages/${id}`);
	}
</script>

<div class="space-y-6 pb-10" in:fade={{ duration: 300 }}>
	<div class="flex items-end justify-between border-b pb-6" style="border-color: #1a1a1a">
		<div>
			<h1 class="text-2xl font-bold text-white">Pages</h1>
			<p class="mt-1 text-sm" style="color: #A1A1A1">
				{pagesStore.value.length} page{pagesStore.value.length !== 1 ? 's' : ''}
			</p>
		</div>
		<button
			onclick={createPage}
			class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
			style="background: #CCFF00; color: #000000;"
		>
			<Plus size={15} /> New Page
		</button>
	</div>

	{#if topLevel.length === 0}
		<p class="py-16 text-center text-sm" style="color: #A1A1A1">No pages yet.</p>
	{:else}
		<ul class="space-y-2">
			{#each topLevel as p (p.id)}
				<li
					class="group flex items-center justify-between rounded-xl p-4"
					style="background: #0A0A0A; border: 1px solid #1a1a1a;"
				>
					<a href="/pages/{p.id}" class="flex flex-1 items-center gap-3 text-white">
						<FileText size={16} style="color: #CCFF00" />
						<span class="text-sm font-medium">{p.title || 'Untitled'}</span>
					</a>
					<button
						onclick={() => pagesStore.deletePage(p.id)}
						aria-label="Delete page"
						class="opacity-0 transition-opacity group-hover:opacity-100"
						style="color: #A1A1A1"
					>
						<Trash2 size={15} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
