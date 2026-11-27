import { browser } from '$app/environment';
import type { Todo } from '$lib/types';
import { normalizeTodo, pruneTombstones } from '$lib/utils/syncMerge';

export type { Todo };

const STORAGE_KEY = 'simple-todos';
const DAY_MS = 24 * 60 * 60 * 1000;

class TodosStore {
	private records = $state<Todo[]>([]);
	private listeners = new Set<() => void>();

	/** Daftar tugas aktif (tidak termasuk tombstone yang sudah dihapus). */
	value = $derived(this.records.filter((t) => !t.deletedAt));

	constructor() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					const fallback = new Date().toISOString();
					const normalized = parsed
						.map((item) => normalizeTodo(item, fallback))
						.filter((item): item is Todo => item !== null);
					const { items, changed } = this.expireAndPrune(normalized);
					this.records = items;
					if (changed || normalized.length !== parsed.length) {
						this.save();
					}
				}
			}
		} catch (e) {
			console.error('Failed to parse todos from localStorage:', e);
			localStorage.removeItem(STORAGE_KEY);
		}

		window.addEventListener('storage', (e) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					const parsed = JSON.parse(e.newValue);
					if (Array.isArray(parsed)) {
						const fallback = new Date().toISOString();
						this.records = parsed
							.map((item) => normalizeTodo(item, fallback))
							.filter((item): item is Todo => item !== null);
					}
				} catch {
					// Abaikan payload storage yang korup
				}
			}
		});

		setInterval(() => {
			const { items, changed } = this.expireAndPrune(this.records);
			if (changed) {
				this.records = items;
				this.commit();
			}
		}, 60_000);
	}

	get allRecords(): Todo[] {
		return this.records;
	}

	onMutate(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private expireAndPrune(items: Todo[]): { items: Todo[]; changed: boolean } {
		const nowMs = Date.now();
		const nowIso = new Date(nowMs).toISOString();
		let changed = false;

		const next = items.map((t) => {
			if (!t.deletedAt && t.completed && t.expiresAt && nowMs >= t.expiresAt) {
				changed = true;
				return { ...t, updatedAt: nowIso, deletedAt: nowIso };
			}
			return t;
		});

		const pruned = pruneTombstones(next, nowMs);
		if (pruned.length !== next.length) changed = true;
		return { items: pruned, changed };
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

	addTodo(text: string) {
		const now = new Date().toISOString();
		const newTodo: Todo = {
			id: crypto.randomUUID(),
			text,
			completed: false,
			createdAt: now,
			updatedAt: now
		};
		this.records = [...this.records, newTodo];
		this.commit();
	}

	toggleTodo(id: number | string) {
		const nowMs = Date.now();
		const nowIso = new Date(nowMs).toISOString();
		this.records = this.records.map((todo) => {
			if (todo.id === id && !todo.deletedAt) {
				const completed = !todo.completed;
				return {
					...todo,
					completed,
					updatedAt: nowIso,
					expiresAt: completed ? nowMs + DAY_MS : undefined
				};
			}
			return todo;
		});
		this.commit();
	}

	deleteTodo(id: number | string) {
		const now = new Date().toISOString();
		this.records = this.records.map((todo) =>
			todo.id === id && !todo.deletedAt ? { ...todo, updatedAt: now, deletedAt: now } : todo
		);
		this.commit();
	}

	clearCompleted() {
		const now = new Date().toISOString();
		let changed = false;
		this.records = this.records.map((todo) => {
			if (!todo.deletedAt && todo.completed) {
				changed = true;
				return { ...todo, updatedAt: now, deletedAt: now };
			}
			return todo;
		});
		if (changed) this.commit();
	}

	/** Dipakai oleh engine sync saat memperbarui data dari merge (tanpa memicu loop sync). */
	replaceAll(items: Todo[]) {
		this.records = pruneTombstones(items);
		this.save();
	}
}

export const todos = new TodosStore();
