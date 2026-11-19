import { browser } from '$app/environment';
import type { Block, BlockType, Page } from '$lib/types';

const STORAGE_KEY = 'foocus-pages';

function newBlock(type: BlockType = 'paragraph'): Block {
	return { id: crypto.randomUUID(), type, content: '', ...(type === 'todo' ? { checked: false } : {}) };
}

class PagesStore {
	value = $state<Page[]>([]);

	constructor() {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) this.value = JSON.parse(stored);
		} catch (e) {
			console.error('Failed to parse pages from localStorage:', e);
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	private save() {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
	}

	private touch(page: Page) {
		page.updatedAt = new Date().toISOString();
		this.save();
	}

	get(id: string): Page | undefined {
		return this.value.find((p) => p.id === id);
	}

	childrenOf(parentId: string | null): Page[] {
		return this.value.filter((p) => p.parentId === parentId);
	}

	addPage(parentId: string | null = null): string {
		const now = new Date().toISOString();
		const page: Page = {
			id: crypto.randomUUID(),
			title: '',
			parentId,
			blocks: [newBlock()],
			createdAt: now,
			updatedAt: now
		};
		this.value = [...this.value, page];
		this.save();
		return page.id;
	}

	updateTitle(id: string, title: string) {
		const page = this.get(id);
		if (!page) return;
		page.title = title;
		this.touch(page);
	}

	/** Hapus halaman beserta semua sub-halamannya. */
	deletePage(id: string) {
		const toDelete = new Set<string>([id]);
		let grew = true;
		while (grew) {
			grew = false;
			for (const p of this.value) {
				if (p.parentId && toDelete.has(p.parentId) && !toDelete.has(p.id)) {
					toDelete.add(p.id);
					grew = true;
				}
			}
		}
		this.value = this.value.filter((p) => !toDelete.has(p.id));
		this.save();
	}

	/** Sisipkan blok baru tepat setelah `afterBlockId`. Mengembalikan id blok baru. */
	addBlock(pageId: string, afterBlockId: string, type: BlockType = 'paragraph'): string {
		const page = this.get(pageId);
		const block = newBlock(type);
		if (!page) return block.id;
		const index = page.blocks.findIndex((b) => b.id === afterBlockId);
		page.blocks.splice(index + 1, 0, block);
		this.touch(page);
		return block.id;
	}

	updateBlock(pageId: string, blockId: string, patch: Partial<Omit<Block, 'id'>>) {
		const page = this.get(pageId);
		const block = page?.blocks.find((b) => b.id === blockId);
		if (!page || !block) return;
		Object.assign(block, patch);
		if (patch.type === 'todo' && block.checked === undefined) block.checked = false;
		this.touch(page);
	}

	deleteBlock(pageId: string, blockId: string) {
		const page = this.get(pageId);
		if (!page || page.blocks.length <= 1) return;
		page.blocks = page.blocks.filter((b) => b.id !== blockId);
		this.touch(page);
	}

	replaceAll(pages: Page[]) {
		this.value = pages;
		this.save();
	}
}

export const pagesStore = new PagesStore();
