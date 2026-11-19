<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus, Trash2 } from 'lucide-svelte';
	import { pagesStore } from '$lib/stores/pagesStore.svelte';
	import { autoresize } from '$lib/actions/autoresize';
	import type { Block, BlockType } from '$lib/types';

	const pageId = $derived(page.params.id ?? '');
	const current = $derived(pagesStore.get(pageId));
	const children = $derived(pagesStore.childrenOf(pageId));

	// Shortcut ala markdown: ketik awalan di blok paragraf kosong, blok berubah tipe.
	const shortcuts: Record<string, BlockType> = {
		'# ': 'heading1',
		'## ': 'heading2',
		'- ': 'bullet',
		'[] ': 'todo'
	};

	const placeholders: Record<BlockType, string> = {
		paragraph: "Tulis sesuatu, atau ketik '# ', '## ', '- ', '[] '",
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

	async function focusBlock(id: string, atEnd = true) {
		await tick(); // tunggu Svelte selesai menggambar ulang DOM
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
					pagesStore.updateBlock(pageId, block.id, { type, content: value.slice(prefix.length) });
					return;
				}
			}
		}
		pagesStore.updateBlock(pageId, block.id, { content: value });
	}

	function handleKeydown(block: Block, index: number, e: KeyboardEvent) {
		if (!current) return;
		const el = e.currentTarget as HTMLTextAreaElement;
		const isList = block.type === 'bullet' || block.type === 'todo';

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			// Enter di list item kosong = keluar dari list (jadi paragraf biasa)
			if (isList && block.content === '') {
				pagesStore.updateBlock(pageId, block.id, { type: 'paragraph' });
				return;
			}
			const nextType: BlockType = isList ? block.type : 'paragraph';
			focusBlock(pagesStore.addBlock(pageId, block.id, nextType));
		}

		if (e.key === 'Backspace' && block.content === '') {
			e.preventDefault();
			if (block.type !== 'paragraph') {
				pagesStore.updateBlock(pageId, block.id, { type: 'paragraph' });
			} else if (index > 0) {
				const prevId = current.blocks[index - 1].id;
				pagesStore.deleteBlock(pageId, block.id);
				focusBlock(prevId);
			}
		}

		if (e.key === 'ArrowUp' && el.selectionStart === 0 && index > 0) {
			e.preventDefault();
			focusBlock(current.blocks[index - 1].id);
		}
		if (e.key === 'ArrowDown' && el.selectionStart === el.value.length && index < current.blocks.length - 1) {
			e.preventDefault();
			focusBlock(current.blocks[index + 1].id, false);
		}
	}

	function addSubPage() {
		const id = pagesStore.addPage(pageId);
		goto(`/pages/${id}`);
	}

	function removePage() {
		if (!current) return;
		const parent = current.parentId;
		pagesStore.deletePage(current.id);
		goto(parent ? `/pages/${parent}` : '/pages');
	}
</script>

{#if !current}
	<div class="py-16 text-center">
		<p class="text-sm" style="color: #A1A1A1">Halaman tidak ditemukan.</p>
		<a href="/pages" class="mt-3 inline-block text-sm underline" style="color: #CCFF00">Kembali ke Pages</a>
	</div>
{:else}
	<div class="mx-auto max-w-3xl space-y-6 pb-24">
		<div class="flex items-start justify-between gap-4">
			<input
				value={current.title}
				oninput={(e) => pagesStore.updateTitle(current.id, e.currentTarget.value)}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						focusBlock(current.blocks[0].id, false);
					}
				}}
				placeholder="Untitled"
				class="w-full bg-transparent text-4xl font-bold text-white outline-none placeholder:text-[#333]"
			/>
			<button onclick={removePage} aria-label="Delete page" class="mt-3" style="color: #A1A1A1">
				<Trash2 size={16} />
			</button>
		</div>

		<div class="space-y-1">
			{#each current.blocks as block, index (block.id)}
				<div class="flex items-start gap-2">
					<div class="flex h-7 w-5 shrink-0 items-center justify-center" style="color: #A1A1A1">
						{#if block.type === 'bullet'}
							•
						{:else if block.type === 'todo'}
							<input
								type="checkbox"
								checked={block.checked}
								onchange={(e) =>
									pagesStore.updateBlock(pageId, block.id, { checked: e.currentTarget.checked })}
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
						onkeydown={(e) => handleKeydown(block, index, e)}
						placeholder={placeholders[block.type]}
						class="w-full resize-none overflow-hidden bg-transparent leading-7 text-white outline-none placeholder:text-[#333] {textClass[block.type]} {block.type === 'todo' && block.checked ? 'line-through opacity-50' : ''}"
					></textarea>
				</div>
			{/each}
		</div>

		<div class="border-t pt-6" style="border-color: #1a1a1a">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-xs font-semibold tracking-widest uppercase" style="color: #525252">Sub-pages</p>
				<button onclick={addSubPage} class="flex items-center gap-1 text-xs" style="color: #CCFF00">
					<Plus size={13} /> Add sub-page
				</button>
			</div>
			{#each children as child (child.id)}
				<a href="/pages/{child.id}" class="block py-1 text-sm text-white hover:underline">
					{child.title || 'Untitled'}
				</a>
			{/each}
		</div>
	</div>
{/if}
