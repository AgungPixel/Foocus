<script lang="ts">
	import { todos } from '$lib/stores/todosStore.svelte';
	import { fly, fade } from 'svelte/transition';
	import { Trash2, Plus } from 'lucide-svelte';

	let newTodoText = $state('');

	function addTodo() {
		if (newTodoText.trim()) {
			todos.addTodo(newTodoText.trim());
			newTodoText = '';
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addTodo();
		}
	}

	const pending = $derived(todos.value.filter((t) => !t.completed).length);
	const done = $derived(todos.value.filter((t) => t.completed).length);
</script>

<div class="space-y-6 pb-10" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="border-b pb-6" style="border-color: #1a1a1a">
		<h1 class="text-2xl font-bold text-white">Tasks</h1>
		<p class="mt-1 text-sm" style="color: #A1A1A1">{pending} pending · {done} done</p>
	</div>

	<!-- Add input -->
	<div class="flex gap-3">
		<input
			type="text"
			bind:value={newTodoText}
			onkeydown={handleKeyPress}
			placeholder="Add a task…"
			class="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1A1] outline-none transition-all"
			style="background: #0A0A0A; border: 1px solid #1a1a1a;"
			onfocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
			onblur={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
		/>
		<button
			onclick={addTodo}
			disabled={!newTodoText.trim()}
			class="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-opacity disabled:opacity-30"
			style="background: #CCFF00; color: #000000;"
		>
			<Plus size={16} /> Add
		</button>
	</div>

	<!-- List -->
	{#if todos.value.length === 0}
		<div class="py-16 text-center" in:fade>
			<p class="text-sm" style="color: #A1A1A1">No tasks yet. Add one above.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each todos.value as todo (todo.id)}
				<div
					class="flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-150"
					style="background: #0A0A0A; border: 1px solid #1a1a1a;"
					in:fly={{ y: 8, duration: 200 }}
					out:fade={{ duration: 150 }}
				>
					<!-- Custom checkbox -->
					<button
						onclick={() => todos.toggleTodo(todo.id)}
						class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-150"
						style={todo.completed
							? 'background: #CCFF00; border-color: #CCFF00;'
							: 'background: transparent; border-color: #333;'}
						aria-label="Toggle task"
					>
						{#if todo.completed}
							<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
								<path d="M1 4L3.5 6.5L9 1" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>

					<span class="flex-1 text-sm transition-all" class:line-through={todo.completed} style={todo.completed ? 'color: #A1A1A1' : 'color: #fff'}>
						{todo.text}
					</span>

					<button
						onclick={() => todos.deleteTodo(todo.id)}
						class="rounded-lg p-1.5 transition-colors"
						style="color: #A1A1A1"
						onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
						onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
						aria-label="Delete task"
					>
						<Trash2 size={15} />
					</button>
				</div>
			{/each}
		</div>

		{#if done > 0}
			<button
				onclick={() => todos.clearCompleted()}
				class="text-xs transition-colors"
				style="color: #A1A1A1"
				onmouseenter={(e) => (e.currentTarget.style.color = '#CCFF00')}
				onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
			>
				Clear {done} completed
			</button>
		{/if}
	{/if}
</div>
