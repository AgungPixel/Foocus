import { browser } from '$app/environment';

export interface Note {
	id: number;
	content: string;
	createdAt: string;
}

function createNotesStore() {
	let notesArray = $state<Note[]>([]);

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
		
		window.addEventListener('storage', (e) => {
			if (e.key === 'simple-notes' && e.newValue) {
				notesArray = JSON.parse(e.newValue);
			}
		});
	}

	function saveStore(value: Note[]) {
		if (browser) {
			localStorage.setItem('simple-notes', JSON.stringify(value));
		}
	}

	return {
		get value() {
			return notesArray;
		},
		addNote: (content: string) => {
			const newNote: Note = {
				id: Date.now(),
				content,
				createdAt: new Date().toISOString()
			};
			notesArray = [...notesArray, newNote];
			saveStore(notesArray);
		},
		deleteNote: (id: number) => {
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
