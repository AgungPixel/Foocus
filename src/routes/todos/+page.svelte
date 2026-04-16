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

	let nowTime = $state(Date.now());
	$effect(() => {
		const interval = setInterval(() => {
			nowTime = Date.now();
		}, 60000); // update ui every minute
		return () => clearInterval(interval);
	});

	function formatTimeLeft(expiresAt: number | undefined) {
		if (!expiresAt) return '';
		const diff = expiresAt - nowTime;
		if (diff <= 0) return 'soon';
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		if (hours > 0) return `${hours}h ${mins}m`;
		return `${mins}m`;
	}
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
				<button
					onclick={() => (todo.completed ? todos.deleteTodo(todo.id) : todos.toggleTodo(todo.id))}
					class="w-full flex flex-col items-start gap-1 rounded-xl px-5 py-4 transition-all duration-150 text-left cursor-pointer group"
					style="background: #0A0A0A; border: 1px solid #1a1a1a;"
					in:fly={{ y: 8, duration: 200 }}
					out:fade={{ duration: 150 }}
					onmouseenter={(e) => {
						if (!todo.completed) e.currentTarget.style.borderColor = '#CCFF00';
						else e.currentTarget.style.borderColor = '#ff4444';
					}}
					onmouseleave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
				>
					<span
						class="text-sm transition-all duration-200"
						class:line-through={todo.completed}
						style={todo.completed ? 'color: #A1A1A1' : 'color: #fff'}
					>
						{todo.text}
					</span>
					
					{#if todo.completed && todo.expiresAt}
						<span class="text-[11px] font-medium transition-colors" style="color: #A1A1A1" class:group-hover:text-[#ff4444]={true}>
							Click again to delete (Auto-clears in {formatTimeLeft(todo.expiresAt)})
						</span>
					{/if}
				</button>
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
