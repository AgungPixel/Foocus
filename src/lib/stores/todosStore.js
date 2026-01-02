import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createTodosStore() {
	const defaultValue = [];
	const initialValue = browser
		? JSON.parse(localStorage.getItem('simple-todos')) || defaultValue
		: defaultValue;

	const { subscribe, set, update } = writable(initialValue);

	return {
		subscribe,
		addTodo: (text) =>
			update((todos) => {
				const newTodo = {
					id: Date.now(),
					text,
					completed: false,
					createdAt: new Date().toISOString()
				};
				const newTodos = [...todos, newTodo];
				if (browser) localStorage.setItem('simple-todos', JSON.stringify(newTodos));
				return newTodos;
			}),
		toggleTodo: (id) =>
			update((todos) => {
				const newTodos = todos.map((todo) =>
					todo.id === id ? { ...todo, completed: !todo.completed } : todo
				);
				if (browser) localStorage.setItem('simple-todos', JSON.stringify(newTodos));
				return newTodos;
			}),
		deleteTodo: (id) =>
			update((todos) => {
				const newTodos = todos.filter((todo) => todo.id !== id);
				if (browser) localStorage.setItem('simple-todos', JSON.stringify(newTodos));
				return newTodos;
			}),
		clearCompleted: () =>
			update((todos) => {
				const newTodos = todos.filter((todo) => !todo.completed);
				if (browser) localStorage.setItem('simple-todos', JSON.stringify(newTodos));
				return newTodos;
			})
	};
}

export const todos = createTodosStore();
