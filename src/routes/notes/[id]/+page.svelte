<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { marked } from 'marked';
	import {
		Check,
		ChevronRight,
		Copy,
		Download,
		Eye,
		FileText,
		Pencil,
		Plus,
		Trash2
	} from 'lucide-svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { autoresize } from '$lib/actions/autoresize';
	import { blocksToMarkdown, markdownToBlocks, sanitizeHtml } from '$lib/utils/markdown';
	import type { Block, BlockType } from '$lib/types';

	const noteId = $derived(page.params.id ?? '');
	const current = $derived(notes.get(noteId));
	const ancestors = $derived(notes.ancestorsOf(noteId));
	const children = $derived(notes.childrenOf(noteId));

	let previewMode = $state(false);
	let copied = $state(false);

	$effect(() => {
		// Reset preview mode ketika berpindah catatan
		noteId;
		previewMode = false;
		copied = false;
	});

	// Shortcut ala markdown: ketik awalan di blok paragraf kosong, blok berubah tipe.
	const shortcuts: Record<string, BlockType> = {
		'# ': 'heading1',
		'## ': 'heading2',
		'- ': 'bullet',
		'[] ': 'todo'
	};

	const placeholders: Record<BlockType, string> = {
		paragraph: "Write something, or type '# ', '## ', '- ', '[] '",
		heading1: 'Heading 1',
		heading2: 'Heading 2',
		bullet: 'List item',
		todo: 'To-do'
	};

	const textClass: Record<BlockType, string> = {
		paragraph: 'text-base',
		heading1: 'text-3xl font-bold',
		heading2: 'text-2xl font-semibold',
		bullet: 'text-base',
		todo: 'text-base'
	};

	const renderedMarkdown = $derived.by(() => {
		if (!current || !previewMode) return '';
		const rawHtml = marked.parse(blocksToMarkdown(current), { async: false });
		return sanitizeHtml(typeof rawHtml === 'string' ? rawHtml : '');
	});

	async function focusBlock(id: string, atEnd = true) {
		await tick();
		const el = document.querySelector<HTMLTextAreaElement>(`[data-block-id="${id}"]`);
		if (!el) return;
		el.focus();
		if (atEnd) el.setSelectionRange(el.value.length, el.value.length);
	}

	function handleInput(block: Block, e: Event) {
		const value = (e.currentTarget as HTMLTextAreaElement).value;

		if (block.type === 'paragraph') {
			for (const [prefix, type] of Object.entries(shortcuts)) {
				if (value.startsWith(prefix)) {
					notes.updateBlock(noteId, block.id, { type, content: value.slice(prefix.length) });
					return;
				}
			}
		}
		notes.updateBlock(noteId, block.id, { content: value });
	}

	async function handlePaste(block: Block, e: ClipboardEvent) {
		const text = e.clipboardData?.getData('text/plain');
		if (!text || !text.includes('\n')) return;

		e.preventDefault();
		const parsed = markdownToBlocks(text);
		const lastId = notes.insertBlocksAfter(noteId, block.id, parsed);
		if (lastId) {
			await focusBlock(lastId);
		}
	}

	function handleKeydown(block: Block, index: number, e: KeyboardEvent) {
		if (!current) return;
		const el = e.currentTarget as HTMLTextAreaElement;
		const isList = block.type === 'bullet' || block.type === 'todo';

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (isList && block.content === '') {
				notes.updateBlock(noteId, block.id, { type: 'paragraph' });
				return;
			}
			const nextType: BlockType = isList ? block.type : 'paragraph';
			focusBlock(notes.addBlock(noteId, block.id, nextType));
		}

		if (e.key === 'Backspace' && block.content === '') {
			e.preventDefault();
			if (block.type !== 'paragraph') {
				notes.updateBlock(noteId, block.id, { type: 'paragraph' });
			} else if (index > 0) {
				const prevId = current.blocks[index - 1].id;
				notes.deleteBlock(noteId, block.id);
				focusBlock(prevId);
			}
		}

		if (e.key === 'ArrowUp' && el.selectionStart === 0 && index > 0) {
			e.preventDefault();
			focusBlock(current.blocks[index - 1].id);
		}
		if (
			e.key === 'ArrowDown' &&
			el.selectionStart === el.value.length &&
			index < current.blocks.length - 1
		) {
			e.preventDefault();
			focusBlock(current.blocks[index + 1].id, false);
		}
	}

	function addSubPage() {
		const id = notes.addNote({ parentId: noteId });
		goto(`/notes/${id}`);
	}

	function removeNote() {
		if (!current) return;
		const parent = current.parentId;
		notes.deleteNote(current.id);
		goto(parent ? `/notes/${parent}` : '/notes');
	}

	async function copyMarkdown() {
		if (!current) return;
		await navigator.clipboard.writeText(blocksToMarkdown(current));
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function downloadMarkdown() {
		if (!current) return;
		const slug = (current.title.trim() || 'untitled')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		const blob = new Blob([blocksToMarkdown(current)], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${slug || 'note'}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

{#if !current}
	<div class="py-16 text-center" in:fade={{ duration: 200 }}>
		<p class="text-sm" style="color: #A1A1A1">Note not found.</p>
		<a href="/notes" class="mt-3 inline-block text-sm underline" style="color: #CCFF00">
			Back to Notes
		</a>
	</div>
{:else}
	<div class="mx-auto max-w-3xl space-y-6 pb-24" in:fade={{ duration: 200 }}>
		<!-- Top Breadcrumb & Actions -->
		<div
			class="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
			style="border-color: #1a1a1a"
		>
			<nav class="flex flex-wrap items-center gap-1.5 text-xs" style="color: #A1A1A1">
				<a href="/notes" class="transition-colors hover:text-white">Notes</a>
				{#each ancestors as ancestor (ancestor.id)}
					<ChevronRight size={13} style="color: #525252" />
					<a
						href="/notes/{ancestor.id}"
						class="max-w-[140px] truncate transition-colors hover:text-white"
					>
						{ancestor.title.trim() || 'Untitled'}
					</a>
				{/each}
				<ChevronRight size={13} style="color: #525252" />
				<span class="max-w-[180px] truncate text-white">
					{current.title.trim() || 'Untitled'}
				</span>
			</nav>

			<div class="flex items-center gap-1">
				<button
					onclick={() => (previewMode = !previewMode)}
					class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
					style={previewMode ? 'background: #1a1a1a; color: #CCFF00;' : 'color: #A1A1A1;'}
					title={previewMode ? 'Edit blocks' : 'Markdown preview'}
				>
					{#if previewMode}
						<Pencil size={13} /> Edit
					{:else}
						<Eye size={13} /> Preview
					{/if}
				</button>

				<button
					onclick={copyMarkdown}
					class="rounded-lg p-1.5 transition-colors"
					style={copied ? 'color: #CCFF00' : 'color: #A1A1A1'}
					title="Copy as Markdown"
					aria-label="Copy as Markdown"
				>
					{#if copied}
						<Check size={15} />
					{:else}
						<Copy size={15} />
					{/if}
				</button>

				<button
					onclick={downloadMarkdown}
					class="rounded-lg p-1.5 transition-colors"
					style="color: #A1A1A1"
					onmouseenter={(e) => (e.currentTarget.style.color = '#CCFF00')}
					onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
					title="Download .md"
					aria-label="Download Markdown"
				>
					<Download size={15} />
				</button>

				<button
					onclick={removeNote}
					class="rounded-lg p-1.5 transition-colors"
					style="color: #A1A1A1"
					onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
					onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
					title="Delete note"
					aria-label="Delete note"
				>
					<Trash2 size={15} />
				</button>
			</div>
		</div>

		{#if previewMode}
			<div
				class="prose prose-sm max-w-none rounded-xl p-6 leading-relaxed prose-invert"
				style="background: #0A0A0A; border: 1px solid #1a1a1a;"
			>
				{@html renderedMarkdown}
			</div>
		{:else}
			<!-- Title -->
			<input
				value={current.title}
				oninput={(e) => notes.updateTitle(current.id, e.currentTarget.value)}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						focusBlock(current.blocks[0].id, false);
					}
				}}
				placeholder="Untitled"
				class="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-[#333] sm:text-4xl"
			/>

			<!-- Block Editor -->
			<div class="space-y-1">
				{#each current.blocks as block, index (block.id)}
					<div class="flex items-start gap-2">
						<div class="flex h-7 w-5 shrink-0 items-center justify-center" style="color: #A1A1A1">
							{#if block.type === 'bullet'}
								<span style="color: #CCFF00">•</span>
							{:else if block.type === 'todo'}
								<input
									type="checkbox"
									checked={block.checked}
									onchange={(e) =>
										notes.updateBlock(noteId, block.id, { checked: e.currentTarget.checked })}
									class="h-3.5 w-3.5 rounded border-[#333] bg-black text-[#CCFF00] focus:ring-0 focus:ring-offset-0"
									aria-label="Mark as done"
								/>
							{/if}
						</div>
						<textarea
							data-block-id={block.id}
							rows="1"
							value={block.content}
							use:autoresize={block.content}
							oninput={(e) => handleInput(block, e)}
							onpaste={(e) => handlePaste(block, e)}
							onkeydown={(e) => handleKeydown(block, index, e)}
							placeholder={placeholders[block.type]}
							class="w-full resize-none overflow-hidden bg-transparent leading-7 text-white outline-none placeholder:text-[#333] {textClass[
								block.type
							]} {block.type === 'todo' && block.checked ? 'line-through opacity-50' : ''}"
						></textarea>
					</div>
				{/each}
			</div>

			<p class="pt-2 text-[11px]" style="color: #525252">
				Shortcuts: # Heading 1 · ## Heading 2 · - Bullet · [] To-do · Paste Markdown auto-splits
				blocks
			</p>
		{/if}

		<!-- Sub-pages -->
		<div class="border-t pt-6" style="border-color: #1a1a1a">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-xs font-semibold tracking-widest uppercase" style="color: #525252">
					Sub-pages
				</p>
				<button
					onclick={addSubPage}
					class="flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
					style="color: #CCFF00"
				>
					<Plus size={13} /> Add sub-page
				</button>
			</div>

			{#if children.length === 0}
				<p class="text-xs" style="color: #525252">No sub-pages yet.</p>
			{:else}
				<div class="grid gap-2 sm:grid-cols-2">
					{#each children as child (child.id)}
						<div
							class="group flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-3 transition-colors hover:border-[#CCFF00]"
						>
							<a href="/notes/{child.id}" class="flex min-w-0 flex-1 items-center gap-2.5">
								<FileText size={14} class="shrink-0" style="color: #CCFF00" />
								<span class="truncate text-sm text-white">
									{child.title.trim() || 'Untitled'}
								</span>
							</a>
							<button
								onclick={() => notes.deleteNote(child.id)}
								aria-label="Delete sub-page"
								class="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
								style="color: #A1A1A1"
								onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
								onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
							>
								<Trash2 size={14} />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
