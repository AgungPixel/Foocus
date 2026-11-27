<script lang="ts">
	import { notes } from '$lib/stores/notesStore.svelte';
	import { todos } from '$lib/stores/todosStore.svelte';
	import { fly, fade } from 'svelte/transition';
	import type { Todo } from '$lib/types';
	import { NotebookPen, ListTodo, ArrowUpRight, FileText } from 'lucide-svelte';

	let greeting = $state('Welcome');

	$effect(() => {
		const hour = new Date().getHours();
		if (hour < 12) greeting = 'Good morning';
		else if (hour < 18) greeting = 'Good afternoon';
		else greeting = 'Good evening';
	});

	const pendingCount = $derived(todos.value.filter((t: Todo) => !t.completed).length);
	const recentNotes = $derived(notes.childrenOf(null).slice(0, 4));
</script>

<div class="space-y-8 pb-10" in:fade={{ duration: 300 }}>
	<!-- ─── Greeting ─── -->
	<div>
		<p class="text-sm" style="color: #A1A1A1">{greeting}</p>
		<h1 class="mt-1 text-3xl font-bold tracking-tight text-white">Your Space</h1>
	</div>

	<!-- ─── Nav Cards ─── -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2" in:fly={{ y: 10, duration: 300, delay: 80 }}>
		<a
			href="/todos"
			class="group flex items-center justify-between rounded-xl p-5 transition-all duration-200"
			style="background: #0A0A0A; border: 1px solid #1a1a1a;"
			onmouseenter={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
			onmouseleave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
					style="background: #111111;"
				>
					<ListTodo size={18} style="color: #CCFF00" />
				</div>
				<div>
					<p class="text-sm font-semibold text-white">Tasks</p>
					<p class="text-xs" style="color: #A1A1A1">{pendingCount} pending</p>
				</div>
			</div>
			<ArrowUpRight
				size={16}
				style="color: #A1A1A1"
				class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</a>

		<a
			href="/notes"
			class="group flex items-center justify-between rounded-xl p-5 transition-all duration-200"
			style="background: #0A0A0A; border: 1px solid #1a1a1a;"
			onmouseenter={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
			onmouseleave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
					style="background: #111111;"
				>
					<NotebookPen size={18} style="color: #CCFF00" />
				</div>
				<div>
					<p class="text-sm font-semibold text-white">Notes</p>
					<p class="text-xs" style="color: #A1A1A1">
						{notes.value.length}
						{notes.value.length === 1 ? 'note' : 'notes'}
					</p>
				</div>
			</div>
			<ArrowUpRight
				size={16}
				style="color: #A1A1A1"
				class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</a>
	</div>

	<!-- ─── Recent Notes ─── -->
	{#if recentNotes.length > 0}
		<div class="space-y-3" in:fly={{ y: 10, duration: 300, delay: 140 }}>
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold tracking-widest uppercase" style="color: #525252">
					Recent Notes
				</p>
				<a href="/notes" class="text-xs transition-colors hover:text-white" style="color: #A1A1A1">
					View all
				</a>
			</div>

			<div class="grid gap-2 sm:grid-cols-2">
				{#each recentNotes as note (note.id)}
					<a
						href="/notes/{note.id}"
						class="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
						style="background: #0A0A0A; border: 1px solid #1a1a1a;"
						onmouseenter={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
						onmouseleave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
					>
						<div class="flex min-w-0 items-center gap-2.5">
							<FileText size={14} class="shrink-0" style="color: #CCFF00" />
							<span class="truncate text-sm text-white">
								{note.title.trim() || 'Untitled'}
							</span>
						</div>
						<span class="ml-3 shrink-0 text-[11px]" style="color: #525252">
							{new Date(note.updatedAt).toLocaleDateString(undefined, {
								month: 'short',
								day: 'numeric'
							})}
						</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
