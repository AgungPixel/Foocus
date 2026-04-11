<script lang="ts">
	import { fly } from 'svelte/transition';
	import { todos } from '$lib/stores/todosStore.svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import type { Todo } from '$lib/stores/todosStore.svelte';

	const pct = $derived(
		todos.value.length
			? Math.round((todos.value.filter((t: Todo) => t.completed).length / todos.value.length) * 100)
			: 0
	);
	const doneCount = $derived(todos.value.filter((t: Todo) => t.completed).length);
</script>

<div
	class="rounded-xl p-5 lg:col-span-1"
	style="background: #0A0A0A; border: 1px solid #1a1a1a;"
	in:fly={{ x: -10, duration: 300, delay: 250 }}
>
	<p class="mb-4 text-xs font-semibold uppercase tracking-widest" style="color: #A1A1A1">Activity</p>

	<!-- Minimal ring -->
	<div class="flex items-center gap-5">
		<div class="relative flex h-20 w-20 shrink-0 items-center justify-center">
			<svg class="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
				<circle cx="40" cy="40" r="34" fill="none" stroke="#1a1a1a" stroke-width="6" />
				<circle
					cx="40" cy="40" r="34" fill="none"
					stroke="#CCFF00" stroke-width="6"
					stroke-linecap="round"
					stroke-dasharray="213.6"
					stroke-dashoffset={213.6 - (213.6 * pct) / 100}
					style="transition: stroke-dashoffset 0.8s ease-out;"
				/>
			</svg>
			<span class="z-10 text-sm font-bold text-white">{pct}%</span>
		</div>

		<div class="space-y-2 flex-1">
			<div class="flex justify-between text-sm">
				<span style="color: #A1A1A1">Done</span>
				<span class="font-semibold text-white">{doneCount}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span style="color: #A1A1A1">Notes</span>
				<span class="font-semibold text-white">{notes.value.length}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span style="color: #A1A1A1">Total</span>
				<span class="font-semibold text-white">{todos.value.length}</span>
			</div>
		</div>
	</div>
</div>
