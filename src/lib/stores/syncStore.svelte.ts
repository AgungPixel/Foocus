import { browser } from '$app/environment';
import { notes } from '$lib/stores/notesStore.svelte';
import { todos } from '$lib/stores/todosStore.svelte';
import type { SyncStatus } from '$lib/types';
import {
	mergeRecords,
	normalizeSnapshot,
	pruneTombstones,
	snapshotsEqual,
	type SyncSnapshotV2
} from '$lib/utils/syncMerge';

const STORAGE_KEY = 'foocus-sync';
const DEBOUNCE_MS = 3500;
const FOCUS_COOLDOWN_MS = 15_000;

class SyncStore {
	code = $state('');
	autoSync = $state(true);
	lastSync = $state<string | null>(null);
	status = $state<SyncStatus>('idle');
	message = $state('');
	failed = $state(false);

	private debounceTimer: ReturnType<typeof setTimeout> | null = null;
	private inFlight: Promise<void> | null = null;
	private rerunRequested = false;
	private lastAttemptAt = 0;
	private initialized = false;

	constructor() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.code = parsed.code ?? '';
				this.autoSync = parsed.autoSync ?? true;
				this.lastSync = parsed.lastSync ?? null;
				if (this.code && this.lastSync) {
					this.status = navigator.onLine ? 'synced' : 'offline';
				}
			}
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}

		// Jadwalkan auto-sync saat ada perubahan lokal di Tasks atau Notes
		todos.onMutate(() => this.scheduleSync());
		notes.onMutate(() => this.scheduleSync());

		window.addEventListener('online', () => {
			if (this.code && this.autoSync) {
				void this.syncNow({ silent: true });
			} else if (this.code) {
				this.status = this.lastSync ? 'synced' : 'idle';
			}
		});

		window.addEventListener('offline', () => {
			if (this.code) {
				this.status = 'offline';
			}
		});

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible' && this.code && this.autoSync) {
				const now = Date.now();
				if (now - this.lastAttemptAt >= FOCUS_COOLDOWN_MS) {
					void this.syncNow({ silent: true });
				}
			}
		});
	}

	/** Dipanggil sekali saat layout aplikasi dimuat. */
	init() {
		if (!browser || this.initialized) return;
		this.initialized = true;
		if (this.code && this.autoSync) {
			void this.syncNow({ silent: true });
		}
	}

	private persist() {
		if (browser) {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					code: this.code,
					autoSync: this.autoSync,
					lastSync: this.lastSync
				})
			);
		}
	}

	private report(message: string, failed = false) {
		this.message = message;
		this.failed = failed;
	}

	createCode() {
		this.code = crypto.randomUUID();
		this.lastSync = null;
		this.status = 'idle';
		this.persist();
		this.report('Kode sync dibuat.');
		if (this.autoSync) {
			void this.syncNow({ silent: false });
		}
	}

	connect(code: string) {
		this.code = code.trim();
		this.lastSync = null;
		this.status = 'idle';
		this.persist();
		this.report('Terhubung. Menggabungkan data…');
		void this.syncNow({ silent: false });
	}

	disconnect() {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
		this.code = '';
		this.lastSync = null;
		this.status = 'idle';
		this.persist();
		this.report('');
	}

	setAutoSync(enabled: boolean) {
		this.autoSync = enabled;
		this.persist();
		if (enabled && this.code) {
			void this.syncNow({ silent: true });
		}
	}

	/** Tunda sync beberapa detik setelah user mengetik agar hemat write quota Cloudflare KV. */
	scheduleSync() {
		if (!browser || !this.code || !this.autoSync) return;
		if (!navigator.onLine) {
			this.status = 'offline';
			return;
		}
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = null;
			void this.syncNow({ silent: true });
		}, DEBOUNCE_MS);
	}

	/**
	 * Two-Way Smart Sync (Last-Write-Wins per item + Tombstones).
	 * Hanya melakukan PUT ke Cloudflare KV jika hasil merge benar-benar berbeda dari data cloud.
	 */
	async syncNow({ silent = false }: { silent?: boolean } = {}): Promise<void> {
		if (!browser || !this.code) return;

		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		if (!navigator.onLine) {
			this.status = 'offline';
			if (!silent) this.report('Perangkat sedang offline. Sync akan berjalan saat online.', true);
			return;
		}

		if (this.inFlight) {
			this.rerunRequested = true;
			return this.inFlight;
		}

		const run = async () => {
			this.lastAttemptAt = Date.now();
			this.status = 'syncing';
			if (!silent) this.report('');

			try {
				const localSnapshot = {
					todos: pruneTombstones(todos.allRecords),
					notes: pruneTombstones(notes.allRecords)
				};

				const res = await fetch(`/api/sync/${this.code}`);

				let remoteSnapshot: SyncSnapshotV2 | null = null;
				if (res.status === 404) {
					remoteSnapshot = null;
				} else if (!res.ok) {
					throw new Error(await this.errorText(res));
				} else {
					const raw = await res.json();
					remoteSnapshot = normalizeSnapshot(raw);
					if (!remoteSnapshot) {
						throw new Error('Format data di cloud tidak dikenali');
					}
				}

				const mergedTodos = remoteSnapshot
					? pruneTombstones(mergeRecords(localSnapshot.todos, remoteSnapshot.todos))
					: localSnapshot.todos;

				const mergedNotes = remoteSnapshot
					? pruneTombstones(mergeRecords(localSnapshot.notes, remoteSnapshot.notes))
					: localSnapshot.notes;

				const mergedData = { todos: mergedTodos, notes: mergedNotes };

				// Perbarui store lokal jika hasil merge berbeda dari kondisi lokal
				if (!snapshotsEqual(localSnapshot, mergedData)) {
					todos.replaceAll(mergedTodos);
					notes.replaceAll(mergedNotes);
				}

				// Hanya kirim PUT ke cloud jika cloud belum ada atau hasil merge berbeda dari cloud
				const needsUpload = !remoteSnapshot || !snapshotsEqual(remoteSnapshot, mergedData);
				const now = new Date().toISOString();

				if (needsUpload) {
					const payload: SyncSnapshotV2 = {
						version: 2,
						savedAt: now,
						todos: mergedTodos,
						notes: mergedNotes
					};
					const putRes = await fetch(`/api/sync/${this.code}`, {
						method: 'PUT',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(payload)
					});
					if (!putRes.ok) throw new Error(await this.errorText(putRes));
				}

				this.lastSync = now;
				this.status = 'synced';
				this.persist();
				if (!silent) {
					this.report(
						needsUpload
							? 'Sync selesai. Data lokal & cloud telah digabungkan.'
							: 'Data sudah sinkron (tidak ada perubahan baru).'
					);
				}
			} catch (e) {
				this.status = navigator.onLine ? 'error' : 'offline';
				if (!silent) {
					this.report(e instanceof Error ? e.message : 'Sync gagal', true);
				}
			} finally {
				this.inFlight = null;
				if (this.rerunRequested) {
					this.rerunRequested = false;
					void this.syncNow({ silent: true });
				}
			}
		};

		this.inFlight = run();
		return this.inFlight;
	}

	private async errorText(res: Response) {
		try {
			const body = await res.json();
			return body.message ?? `Error ${res.status}`;
		} catch {
			return `Error ${res.status}`;
		}
	}
}

export const sync = new SyncStore();
