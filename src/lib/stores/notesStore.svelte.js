import { browser } from '$app/environment';

function createNotesStore() {
	let notesArray = $state([]);

	if (browser) {
		try {
			const stored = localStorage.getItem('simple-notes');
			if (stored) {
				notesArray = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to parse notes from localStorage:', e);
			localStorage.removeItem('simple-notes');
		}
	}

	function saveStore(value) {
		if (browser) {
			localStorage.setItem('simple-notes', JSON.stringify(value));
		}
	}

	return {
		get value() {
			return notesArray;
		},
		addNote: (content) => {
			const newNote = {
				id: Date.now(),
				content,
				createdAt: new Date().toISOString()
			};
			notesArray = [...notesArray, newNote];
			saveStore(notesArray);
		},
		deleteNote: (id) => {
			notesArray = notesArray.filter((note) => note.id !== id);
			saveStore(notesArray);
		},
		clearAll: () => {
			notesArray = [];
			if (browser) localStorage.removeItem('simple-notes');
		}
	};
}

export const notes = createNotesStore();
