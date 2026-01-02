import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createNotesStore() {
	const defaultValue = [];
	const initialValue = browser
		? JSON.parse(localStorage.getItem('simple-notes')) || defaultValue
		: defaultValue;

	const { subscribe, set, update } = writable(initialValue);

	return {
		subscribe,
		addNote: (content) =>
			update((notes) => {
				const newNote = {
					id: Date.now(),
					content,
					createdAt: new Date().toISOString()
				};
				const newNotes = [...notes, newNote];
				if (browser) localStorage.setItem('simple-notes', JSON.stringify(newNotes));
				return newNotes;
			}),
		deleteNote: (id) =>
			update((notes) => {
				const newNotes = notes.filter((note) => note.id !== id);
				if (browser) localStorage.setItem('simple-notes', JSON.stringify(newNotes));
				return newNotes;
			}),
		clearAll: () => {
			if (browser) localStorage.removeItem('simple-notes');
			set([]);
		}
	};
}

export const notes = createNotesStore();
