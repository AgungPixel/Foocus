<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Check, Copy, Download, FileText, FolderTree, Plus, Search, Trash2 } from 'lucide-svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { blocksToMarkdown, getExcerpt } from '$lib/utils/markdown';
	import type { NotePage } from '$lib/types';

	let quickTitle = $state('');
	let searchQuery = $state('');
	let copiedId = $state<string | null>(null);

	const rootNotes = $derived(notes.childrenOf(null));

	const visibleNotes = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return rootNotes;

		return notes.value
			.filter((n) => {
				const titleMatch = n.title.toLowerCase().includes(q);
				const contentMatch = n.blocks.some((b) => b.content.toLowerCase().includes(q));
				return titleMatch || contentMatch;
			})
			.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	});

	function createEmptyNote() {
		const id = notes.addNote({ parentId: null });
		goto(`/notes/${id}`);
	}

	function createQuickNote() {
		const trimmed = quickTitle.trim();
		if (!trimmed) {
			createEmptyNote();
			return;
		}
		const id = notes.addNote({ title: trimmed, parentId: null });
		quickTitle = '';
		goto(`/notes/${id}`);
	}

	function handleQuickKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			createQuickNote();
		}
	}

	function subPageCount(id: string): number {
		return notes.childrenOf(id).length;
	}

	async function copyMarkdown(e: MouseEvent, note: NotePage) {
		e.preventDefault();
		e.stopPropagation();
		await navigator.clipboard.writeText(blocksToMarkdown(note));
		copiedId = note.id;
		setTimeout(() => {
			if (copiedId === note.id) copiedId = null;
		}, 1500);
	}

	function downloadMarkdown(e: MouseEvent, note: NotePage) {
		e.preventDefault();
		e.stopPropagation();
		const slug = (note.title.trim() || 'untitled')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		const blob = new Blob([blocksToMarkdown(note)], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${slug || 'note'}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function deleteNote(e: MouseEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();
		notes.deleteNote(id);
	}

	function clearAllNotes() {
		if (confirm('Hapus semua catatan dan sub-halaman?')) {
			notes.clearAll();
		}
	}
</script>

<div class="space-y-6 pb-10" in:fade={{ duration: 250 }}>
	<!-- Header -->
	<div
		class="flex flex-wrap items-end justify-between gap-4 border-b pb-6"
		style="border-color: #1a1a1a"
	>
		<div>
			<h1 class="text-2xl font-bold text-white">Notes</h1>
			<p class="mt-1 text-sm" style="color: #A1A1A1">
				{notes.value.length}
				{notes.value.length === 1 ? 'note' : 'notes'}
			</p>
		</div>

		<button
			onclick={createEmptyNote}
			class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
			style="background: #CCFF00; color: #000000;"
		>
			<Plus size={15} /> New Note
		</button>
	</div>

	<!-- Quick capture & search -->
	<div class="flex flex-col gap-3 sm:flex-row">
		<div class="flex flex-1 gap-2">
			<input
				type="text"
				bind:value={quickTitle}
				onkeydown={handleQuickKeydown}
				placeholder="New note title, press Enter…"
				class="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1A1] transition-colors outline-none"
				style="background: #0A0A0A; border: 1px solid #1a1a1a;"
				onfocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
				onblur={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
			/>
		</div>

		{#if notes.value.length > 0}
			<div class="relative sm:w-64">
				<Search
					size={15}
					class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
					style="color: #525252"
				/>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Search notes…"
					class="w-full rounded-xl py-3 pr-4 pl-9 text-sm text-white placeholder-[#525252] transition-colors outline-none"
					style="background: #0A0A0A; border: 1px solid #1a1a1a;"
					onfocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
					onblur={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
				/>
			</div>
		{/if}
	</div>

	<!-- Notes List / Grid -->
	{#if notes.value.length === 0}
		<div class="py-16 text-center" in:fade>
			<p class="text-sm" style="color: #A1A1A1">No notes yet. Create one above.</p>
		</div>
	{:else if visibleNotes.length === 0}
		<div class="py-16 text-center" in:fade>
			<p class="text-sm" style="color: #A1A1A1">No notes match "{searchQuery}".</p>
		</div>
	{:else}
		<div class="space-y-3">
			<div class="flex justify-end">
				<button
					onclick={clearAllNotes}
					class="text-xs transition-colors"
					style="color: #A1A1A1"
					onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
					onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
				>
					Clear all
				</button>
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				{#each visibleNotes as note (note.id)}
					{@const excerpt = getExcerpt(note.blocks)}
					{@const subs = subPageCount(note.id)}
					<a
						href="/notes/{note.id}"
						class="group flex flex-col justify-between rounded-xl p-5 transition-colors duration-200"
						style="background: #0A0A0A; border: 1px solid #1a1a1a;"
						in:fly={{ y: 6, duration: 180 }}
						onmouseenter={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
						onmouseleave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
					>
						<div class="space-y-2">
							<div class="flex items-start justify-between gap-3">
								<div class="flex min-w-0 items-center gap-2.5">
									<FileText size={15} class="shrink-0" style="color: #CCFF00" />
									<h2 class="truncate text-sm font-semibold text-white">
										{note.title.trim() || 'Untitled'}
									</h2>
								</div>
								{#if subs > 0}
									<span
										class="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px]"
										style="background: #111111; color: #A1A1A1; border: 1px solid #1a1a1a;"
									>
										<FolderTree size={11} />
										{subs}
									</span>
								{/if}
							</div>

							<p class="line-clamp-2 text-xs leading-relaxed" style="color: #A1A1A1">
								{excerpt || 'Empty note'}
							</p>
						</div>

						<div
							class="mt-4 flex items-center justify-between border-t pt-3"
							style="border-color: #1a1a1a"
						>
							<span class="text-[11px]" style="color: #525252">
								{new Date(note.updatedAt).toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric',
									year: 'numeric'
								})}
							</span>

							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={(e) => copyMarkdown(e, note)}
									class="rounded-lg p-1.5 transition-colors"
									style={copiedId === note.id ? 'color: #CCFF00' : 'color: #A1A1A1'}
									title="Copy as Markdown"
									aria-label="Copy as Markdown"
								>
									{#if copiedId === note.id}
										<Check size={14} />
									{:else}
										<Copy size={14} />
									{/if}
								</button>
								<button
									type="button"
									onclick={(e) => downloadMarkdown(e, note)}
									class="rounded-lg p-1.5 transition-colors"
									style="color: #A1A1A1"
									onmouseenter={(e) => (e.currentTarget.style.color = '#CCFF00')}
									onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
									title="Download .md"
									aria-label="Download Markdown"
								>
									<Download size={14} />
								</button>
								<button
									type="button"
									onclick={(e) => deleteNote(e, note.id)}
									class="rounded-lg p-1.5 transition-colors"
									style="color: #A1A1A1"
									onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
									onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
									title="Delete"
									aria-label="Delete note"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
