import { browser } from '$app/environment';
import type { Block, BlockType, LegacyNote, NotePage } from '$lib/types';
import { createBlock, migrateLegacyNote } from '$lib/utils/markdown';
import { mergeRecords, normalizeNotePage, pruneTombstones } from '$lib/utils/syncMerge';

const STORAGE_KEY = 'foocus-notes';
const LEGACY_NOTES_KEY = 'simple-notes';
const LEGACY_PAGES_KEY = 'foocus-pages';

class NotesStore {
	private records = $state<NotePage[]>([]);
	private listeners = new Set<() => void>();

	/** Daftar semua catatan/halaman aktif (tidak termasuk yang dihapus). */
	value = $derived(this.records.filter((n) => !n.deletedAt));

	constructor() {
		if (!browser) return;

		this.loadAndMigrate();

		window.addEventListener('storage', (e) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					const parsed = JSON.parse(e.newValue);
					if (Array.isArray(parsed)) {
						const fallback = new Date().toISOString();
						this.records = parsed
							.map((item) => normalizeNotePage(item, fallback))
							.filter((item): item is NotePage => item !== null);
					}
				} catch {
					// Abaikan payload storage yang korup
				}
			}
		});
	}

	get allRecords(): NotePage[] {
		return this.records;
	}

	onMutate(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private loadAndMigrate() {
		const fallback = new Date().toISOString();
		let current: NotePage[] = [];
		let migrated = false;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					current = parsed
						.map((item) => normalizeNotePage(item, fallback))
						.filter((item): item is NotePage => item !== null);
				}
			}
		} catch (e) {
			console.error('Failed to parse notes from localStorage:', e);
			localStorage.removeItem(STORAGE_KEY);
		}

		// Migrasi otomatis data lama dari foocus-pages & simple-notes bila ada
		const legacyPagesRaw = localStorage.getItem(LEGACY_PAGES_KEY);
		if (legacyPagesRaw) {
			try {
				const parsed = JSON.parse(legacyPagesRaw);
				if (Array.isArray(parsed)) {
					const pages = parsed
						.map((p) => normalizeNotePage(p, fallback))
						.filter((p): p is NotePage => p !== null);
					current = mergeRecords(current, pages);
				}
			} catch {
				// Abaikan jika rusak
			}
			localStorage.removeItem(LEGACY_PAGES_KEY);
			migrated = true;
		}

		const legacyNotesRaw = localStorage.getItem(LEGACY_NOTES_KEY);
		if (legacyNotesRaw) {
			try {
				const parsed = JSON.parse(legacyNotesRaw) as LegacyNote[];
				if (Array.isArray(parsed)) {
					const converted = parsed
						.filter((n) => n && typeof n.content === 'string')
						.map((n) => migrateLegacyNote(n));
					current = mergeRecords(current, converted);
				}
			} catch {
				// Abaikan jika rusak
			}
			localStorage.removeItem(LEGACY_NOTES_KEY);
			migrated = true;
		}

		const pruned = pruneTombstones(current);
		this.records = pruned;
		if (migrated || pruned.length !== current.length) {
			this.save();
		}
	}

	private save() {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
		}
	}

	private commit() {
		this.save();
		for (const listener of this.listeners) {
			listener();
		}
	}

	private touch(note: NotePage) {
		note.updatedAt = new Date().toISOString();
		this.commit();
	}

	get(id: string): NotePage | undefined {
		return this.records.find((n) => n.id === id && !n.deletedAt);
	}

	childrenOf(parentId: string | null): NotePage[] {
		return this.records
			.filter((n) => !n.deletedAt && n.parentId === parentId)
			.sort((a, b) => {
				// Root notes diurutkan terbaru diubah; sub-pages urut waktu dibuat
				if (parentId === null) {
					return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
				}
				return Date.parse(a.createdAt) - Date.parse(b.createdAt);
			});
	}

	ancestorsOf(id: string): NotePage[] {
		const chain: NotePage[] = [];
		const seen = new Set<string>([id]);
		let current = this.get(id);

		while (current?.parentId && !seen.has(current.parentId)) {
			seen.add(current.parentId);
			const parent = this.get(current.parentId);
			if (!parent) break;
			chain.unshift(parent);
			current = parent;
		}
		return chain;
	}

	addNote(options: { title?: string; parentId?: string | null; blocks?: Block[] } = {}): string {
		const now = new Date().toISOString();
		const note: NotePage = {
			id: crypto.randomUUID(),
			title: options.title ?? '',
			parentId: options.parentId ?? null,
			blocks:
				options.blocks && options.blocks.length > 0
					? options.blocks
					: [createBlock('paragraph', '')],
			createdAt: now,
			updatedAt: now
		};
		this.records = [...this.records, note];
		this.commit();
		return note.id;
	}

	updateTitle(id: string, title: string) {
		const note = this.get(id);
		if (!note) return;
		note.title = title;
		this.touch(note);
	}

	/** Soft-delete catatan beserta semua sub-halamannya (membuat tombstone untuk sync). */
	deleteNote(id: string) {
		const toDelete = new Set<string>([id]);
		let grew = true;
		while (grew) {
			grew = false;
			for (const n of this.records) {
				if (!n.deletedAt && n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
					toDelete.add(n.id);
					grew = true;
				}
			}
		}

		const now = new Date().toISOString();
		let changed = false;
		this.records = this.records.map((n) => {
			if (!n.deletedAt && toDelete.has(n.id)) {
				changed = true;
				return { ...n, updatedAt: now, deletedAt: now };
			}
			return n;
		});
		if (changed) this.commit();
	}

	/** Sisipkan blok baru tepat setelah `afterBlockId`. */
	addBlock(
		noteId: string,
		afterBlockId: string,
		type: BlockType = 'paragraph',
		content = ''
	): string {
		const note = this.get(noteId);
		const block = createBlock(type, content);
		if (!note) return block.id;
		const index = note.blocks.findIndex((b) => b.id === afterBlockId);
		note.blocks.splice(index + 1, 0, block);
		this.touch(note);
		return block.id;
	}

	/** Sisipkan beberapa blok hasil paste Markdown setelah `afterBlockId`. */
	insertBlocksAfter(noteId: string, afterBlockId: string, blocks: Block[]): string | null {
		const note = this.get(noteId);
		if (!note || blocks.length === 0) return null;
		const index = note.blocks.findIndex((b) => b.id === afterBlockId);
		if (index === -1) return null;

		const current = note.blocks[index];
		// Jika blok saat ini kosong & paragraf, ganti blok kosong tersebut
		if (current.type === 'paragraph' && current.content === '') {
			note.blocks.splice(index, 1, ...blocks);
		} else {
			note.blocks.splice(index + 1, 0, ...blocks);
		}
		this.touch(note);
		return blocks[blocks.length - 1].id;
	}

	updateBlock(noteId: string, blockId: string, patch: Partial<Omit<Block, 'id'>>) {
		const note = this.get(noteId);
		const block = note?.blocks.find((b) => b.id === blockId);
		if (!note || !block) return;
		Object.assign(block, patch);
		if (patch.type === 'todo' && block.checked === undefined) block.checked = false;
		this.touch(note);
	}

	deleteBlock(noteId: string, blockId: string) {
		const note = this.get(noteId);
		if (!note || note.blocks.length <= 1) return;
		note.blocks = note.blocks.filter((b) => b.id !== blockId);
		this.touch(note);
	}

	clearAll() {
		const now = new Date().toISOString();
		let changed = false;
		this.records = this.records.map((n) => {
			if (!n.deletedAt) {
				changed = true;
				return { ...n, updatedAt: now, deletedAt: now };
			}
			return n;
		});
		if (changed) this.commit();
	}

	/** Dipakai oleh engine sync saat memperbarui data dari merge (tanpa memicu loop sync). */
	replaceAll(items: NotePage[]) {
		this.records = pruneTombstones(items);
		this.save();
	}
}

export const notes = new NotesStore();
