<script lang="ts">
	import WindowFrame from '$lib/components/WindowFrame.svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { todos } from '$lib/stores/todosStore.svelte';

	import type { Note } from '$lib/stores/notesStore.svelte';
	import type { Todo } from '$lib/stores/todosStore.svelte';
</script>

<WindowFrame title="Dashboard" isLocked={true}>
	<div class="space-y-6">
		<h1 class="text-3xl font-bold">Simple Notes & Todo App</h1>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Stats -->
			<div class="p-6">
				<h3 class="mb-4 text-xl font-semibold">Statistics</h3>
				<div class="space-y-2">
					<p>Total Notes: {notes.value.length}</p>
					<p>Total Todos: {todos.value.length}</p>
					<p>Completed Todos: {todos.value.filter((t: Todo) => t.completed).length}</p>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="p-6">
				<h3 class="mb-4 text-xl font-semibold">Quick Actions</h3>
				<div class="space-y-2">
					<a
						href="/notes"
						class="block rounded bg-black p-3 text-white transition-colors hover:bg-gray-800"
					>
						Create New Note
					</a>
					<a
						href="/todos"
						class="block rounded bg-gray-800 p-3 text-white transition-colors hover:bg-gray-700"
					>
						Add New Todo
					</a>
				</div>
			</div>
		</div>

		<!-- Recent Notes -->
		<div class="p-6">
			<h3 class="mb-4 text-xl font-semibold">Recent Notes</h3>
			{#if notes.value.length === 0}
				<p>No notes yet. Create your first note!</p>
			{:else}
				<div class="space-y-3">
					{#each notes.value.slice(-3).reverse() as note}
						<div class="p-3">
							<p class="truncate">{note.content.substring(0, 100)}...</p>
							<p class="mt-1 text-sm">
								{new Date(note.createdAt).toLocaleDateString()}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</WindowFrame>
