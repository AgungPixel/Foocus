import { browser } from '$app/environment';
import { notes } from '$lib/stores/notesStore.svelte';
import { todos } from '$lib/stores/todosStore.svelte';
import { pagesStore } from '$lib/stores/pagesStore.svelte';

const STORAGE_KEY = 'foocus-sync';

interface Snapshot {
	version: 1;
	savedAt: string;
	notes: unknown[];
	todos: unknown[];
	pages: unknown[];
}

class SyncStore {
	code = $state('');
	lastSync = $state<string | null>(null);
	busy = $state(false);
	message = $state('');
	failed = $state(false);

	constructor() {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				this.code = parsed.code ?? '';
				this.lastSync = parsed.lastSync ?? null;
			}
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	private persist() {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: this.code, lastSync: this.lastSync }));
		}
	}

	private report(message: string, failed = false) {
		this.message = message;
		this.failed = failed;
	}

	createCode() {
		this.code = crypto.randomUUID();
		this.lastSync = null;
		this.persist();
		this.report('Kode baru dibuat. Tekan Upload untuk menyimpan data ke cloud.');
	}

	connect(code: string) {
		this.code = code.trim();
		this.lastSync = null;
		this.persist();
		this.report('Terhubung. Tekan Download untuk mengambil data dari cloud.');
	}

	disconnect() {
		this.code = '';
		this.lastSync = null;
		this.persist();
		this.report('');
	}

	/** Kirim data di perangkat ini ke cloud (menimpa data cloud). */
	async push() {
		this.busy = true;
		try {
			const snapshot: Snapshot = {
				version: 1,
				savedAt: new Date().toISOString(),
				notes: notes.value,
				todos: todos.value,
				pages: pagesStore.value
			};
			const res = await fetch(`/api/sync/${this.code}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(snapshot)
			});
			if (!res.ok) throw new Error(await this.errorText(res));
			this.lastSync = snapshot.savedAt;
			this.persist();
			this.report('Upload berhasil.');
		} catch (e) {
			this.report(e instanceof Error ? e.message : 'Upload gagal', true);
		} finally {
			this.busy = false;
		}
	}

	/** Ambil data dari cloud (menimpa data di perangkat ini). */
	async pull() {
		this.busy = true;
		try {
			const res = await fetch(`/api/sync/${this.code}`);
			if (!res.ok) throw new Error(await this.errorText(res));
			const data = (await res.json()) as Partial<Snapshot>;
			if (!Array.isArray(data.notes) || !Array.isArray(data.todos) || !Array.isArray(data.pages)) {
				throw new Error('Format data di cloud tidak dikenali');
			}
			notes.replaceAll(data.notes as never[]);
			todos.replaceAll(data.todos as never[]);
			pagesStore.replaceAll(data.pages as never[]);
			this.lastSync = data.savedAt ?? new Date().toISOString();
			this.persist();
			this.report('Download berhasil. Data di perangkat ini sudah diperbarui.');
		} catch (e) {
			this.report(e instanceof Error ? e.message : 'Download gagal', true);
		} finally {
			this.busy = false;
		}
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
