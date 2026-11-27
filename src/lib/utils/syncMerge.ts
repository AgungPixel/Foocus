import type { Block, LegacyNote, NotePage, Todo } from '$lib/types';
import { createBlock, migrateLegacyNote } from '$lib/utils/markdown';

export interface SyncSnapshotV2 {
	version: 2;
	savedAt: string;
	todos: Todo[];
	notes: NotePage[];
}

export interface LegacySyncSnapshotV1 {
	version?: number;
	savedAt?: string;
	todos?: unknown[];
	notes?: unknown[];
	pages?: unknown[];
}

export const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function toValidIso(value: unknown, fallback: string): string {
	if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
		return value;
	}
	return fallback;
}

function getEffectiveTime(item: { updatedAt: string; deletedAt?: string }): number {
	const updated = Date.parse(item.updatedAt);
	const deleted = item.deletedAt ? Date.parse(item.deletedAt) : Number.NaN;
	if (!Number.isNaN(deleted) && (Number.isNaN(updated) || deleted > updated)) {
		return deleted;
	}
	return Number.isNaN(updated) ? 0 : updated;
}

export function normalizeTodo(raw: unknown, fallbackIso = new Date().toISOString()): Todo | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	if (obj.id === undefined || obj.id === null || typeof obj.text !== 'string') return null;

	const createdAt = toValidIso(obj.createdAt, fallbackIso);
	const updatedAt = toValidIso(obj.updatedAt, createdAt);
	const todo: Todo = {
		id: typeof obj.id === 'number' || typeof obj.id === 'string' ? obj.id : String(obj.id),
		text: obj.text,
		completed: Boolean(obj.completed),
		createdAt,
		updatedAt
	};

	if (typeof obj.expiresAt === 'number' && Number.isFinite(obj.expiresAt)) {
		todo.expiresAt = obj.expiresAt;
	}
	if (typeof obj.deletedAt === 'string' && !Number.isNaN(Date.parse(obj.deletedAt))) {
		todo.deletedAt = obj.deletedAt;
	}
	return todo;
}

function normalizeBlock(raw: unknown): Block | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	const validTypes = new Set(['paragraph', 'heading1', 'heading2', 'bullet', 'todo']);
	const type =
		typeof obj.type === 'string' && validTypes.has(obj.type)
			? (obj.type as Block['type'])
			: 'paragraph';
	const id = typeof obj.id === 'string' && obj.id ? obj.id : crypto.randomUUID();
	const content = typeof obj.content === 'string' ? obj.content : '';
	return {
		id,
		type,
		content,
		...(type === 'todo' ? { checked: Boolean(obj.checked) } : {})
	};
}

export function normalizeNotePage(
	raw: unknown,
	fallbackIso = new Date().toISOString()
): NotePage | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;

	// Deteksi LegacyNote dari versi lama ({ id: number, content: string, createdAt: string })
	if (typeof obj.content === 'string' && !Array.isArray(obj.blocks)) {
		const idNum = typeof obj.id === 'number' ? obj.id : Number(obj.id);
		if (Number.isFinite(idNum)) {
			const legacy: LegacyNote = {
				id: idNum,
				content: obj.content,
				createdAt: toValidIso(obj.createdAt, fallbackIso)
			};
			return migrateLegacyNote(legacy);
		}
	}

	if (typeof obj.id !== 'string' || !obj.id) return null;
	const createdAt = toValidIso(obj.createdAt, fallbackIso);
	const updatedAt = toValidIso(obj.updatedAt, createdAt);
	const rawBlocks = Array.isArray(obj.blocks)
		? obj.blocks.map(normalizeBlock).filter((b): b is Block => b !== null)
		: [];

	const note: NotePage = {
		id: obj.id,
		title: typeof obj.title === 'string' ? obj.title : '',
		parentId: typeof obj.parentId === 'string' && obj.parentId ? obj.parentId : null,
		blocks: rawBlocks.length > 0 ? rawBlocks : [createBlock('paragraph', '')],
		createdAt,
		updatedAt
	};

	if (typeof obj.deletedAt === 'string' && !Number.isNaN(Date.parse(obj.deletedAt))) {
		note.deletedAt = obj.deletedAt;
	}
	return note;
}

/** Normalisasi payload snapshot v1 maupun v2 dari cloud/local menjadi SyncSnapshotV2. */
export function normalizeSnapshot(raw: unknown): SyncSnapshotV2 | null {
	if (!raw || typeof raw !== 'object') return null;
	const data = raw as LegacySyncSnapshotV1;
	const savedAt = toValidIso(data.savedAt, new Date().toISOString());

	const todos = Array.isArray(data.todos)
		? data.todos.map((t) => normalizeTodo(t, savedAt)).filter((t): t is Todo => t !== null)
		: [];

	const rawNotes = [
		...(Array.isArray(data.notes) ? data.notes : []),
		...(Array.isArray(data.pages) ? data.pages : [])
	];

	const normalizedNotes = rawNotes
		.map((n) => normalizeNotePage(n, savedAt))
		.filter((n): n is NotePage => n !== null);

	// Deduplikasi jika ada ID ganda dalam snapshot
	const notes = mergeRecords([], normalizedNotes);

	return {
		version: 2,
		savedAt,
		todos: mergeRecords([], todos),
		notes
	};
}

/**
 * Gabungkan dua koleksi item menggunakan Last-Write-Wins berdasarkan `updatedAt` / `deletedAt`.
 * Perubahan offline di perangkat berbeda akan saling melengkapi tanpa menimpa satu sama lain.
 */
export function mergeRecords<
	T extends { id: string | number; updatedAt: string; deletedAt?: string }
>(local: T[], remote: T[]): T[] {
	const map = new Map<string, T>();

	for (const item of local) {
		map.set(String(item.id), item);
	}

	for (const remoteItem of remote) {
		const key = String(remoteItem.id);
		const localItem = map.get(key);
		if (!localItem) {
			map.set(key, remoteItem);
			continue;
		}

		const localTime = getEffectiveTime(localItem);
		const remoteTime = getEffectiveTime(remoteItem);

		if (remoteTime > localTime) {
			map.set(key, remoteItem);
		} else if (remoteTime === localTime) {
			// Tie-breaker deterministik: tombstone menang jika salah satu dihapus
			if (remoteItem.deletedAt && !localItem.deletedAt) {
				map.set(key, remoteItem);
			}
		}
	}

	return Array.from(map.values());
}

/** Bersihkan tombstone yang sudah melewati masa retensi (default 30 hari). */
export function pruneTombstones<T extends { deletedAt?: string }>(
	items: T[],
	nowMs = Date.now(),
	ttlMs = TOMBSTONE_TTL_MS
): T[] {
	return items.filter((item) => {
		if (!item.deletedAt) return true;
		const deletedMs = Date.parse(item.deletedAt);
		if (Number.isNaN(deletedMs)) return false;
		return nowMs - deletedMs < ttlMs;
	});
}

function stableSortById<T extends { id: string | number }>(items: T[]): T[] {
	return [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/** Cek apakah dua snapshot identik secara data (mengabaikan `savedAt`). */
export function snapshotsEqual(
	a: { todos: Todo[]; notes: NotePage[] },
	b: { todos: Todo[]; notes: NotePage[] }
): boolean {
	return (
		JSON.stringify(stableSortById(a.todos)) === JSON.stringify(stableSortById(b.todos)) &&
		JSON.stringify(stableSortById(a.notes)) === JSON.stringify(stableSortById(b.notes))
	);
}
