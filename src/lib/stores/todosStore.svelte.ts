import { browser } from '$app/environment';

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	createdAt: string;
	expiresAt?: number;
}

class TodosStore {
	value = $state<Todo[]>([]);

	constructor() {
		if (browser) {
			try {
				const stored = localStorage.getItem('simple-todos');
				if (stored) {
					const now = Date.now();
					const parsed = JSON.parse(stored);
					this.value = parsed.filter((t: Todo) => !(t.completed && t.expiresAt && now >= t.expiresAt));
					if (parsed.length !== this.value.length) {
						this.save();
					}
				}
			} catch (e) {
				console.error('Failed to parse todos from localStorage:', e);
				localStorage.removeItem('simple-todos');
			}
			
			window.addEventListener('storage', (e) => {
				if (e.key === 'simple-todos' && e.newValue) {
					this.value = JSON.parse(e.newValue);
				}
			});

			setInterval(() => {
				const now = Date.now();
				let changed = false;
				this.value = this.value.filter(t => {
					if (t.completed && t.expiresAt && now >= t.expiresAt) {
						changed = true;
						return false;
					}
					return true;
				});
				if (changed) this.save();
			}, 60000);
		}
	}

	private save() {
		if (browser) {
			localStorage.setItem('simple-todos', JSON.stringify(this.value));
		}
	}

	addTodo(text: string) {
		const newTodo: Todo = {
			id: Date.now(),
			text,
			completed: false,
			createdAt: new Date().toISOString()
		};
		this.value = [...this.value, newTodo];
		this.save();
	}

	toggleTodo(id: number) {
		this.value = this.value.map((todo) => {
			if (todo.id === id) {
				const completed = !todo.completed;
				return { 
					...todo, 
					completed,
					expiresAt: completed ? Date.now() + 24 * 60 * 60 * 1000 : undefined 
				};
			}
			return todo;
		});
		this.save();
	}

	deleteTodo(id: number) {
		this.value = this.value.filter((todo) => todo.id !== id);
		this.save();
	}

	clearCompleted() {
		this.value = this.value.filter((todo) => !todo.completed);
		this.save();
	}
}

export const todos = new TodosStore();
