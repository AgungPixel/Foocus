import { browser } from '$app/environment';

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	createdAt: string;
}

function createTodosStore() {
	let todosArray = $state<Todo[]>([]);

	if (browser) {
		try {
			const stored = localStorage.getItem('simple-todos');
			if (stored) {
				todosArray = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Failed to parse todos from localStorage:', e);
			localStorage.removeItem('simple-todos');
		}
	}

	function saveStore(value: Todo[]) {
		if (browser) {
			localStorage.setItem('simple-todos', JSON.stringify(value));
		}
	}

	return {
		get value() {
			return todosArray;
		},
		addTodo: (text: string) => {
			const newTodo: Todo = {
				id: Date.now(),
				text,
				completed: false,
				createdAt: new Date().toISOString()
			};
			todosArray = [...todosArray, newTodo];
			saveStore(todosArray);
		},
		toggleTodo: (id: number) => {
			todosArray = todosArray.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo
			);
			saveStore(todosArray);
		},
		deleteTodo: (id: number) => {
			todosArray = todosArray.filter((todo) => todo.id !== id);
			saveStore(todosArray);
		},
		clearCompleted: () => {
			todosArray = todosArray.filter((todo) => !todo.completed);
			saveStore(todosArray);
		}
	};
}

export const todos = createTodosStore();
