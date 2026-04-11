<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { Clock, Plus } from 'lucide-svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
</script>

<div
	class="flex flex-col rounded-xl p-5 lg:col-span-2"
	style="background: #0A0A0A; border: 1px solid #1a1a1a;"
	in:fly={{ x: 10, duration: 300, delay: 300 }}
>
	<div class="mb-4 flex items-center justify-between">
		<p class="text-xs font-semibold uppercase tracking-widest" style="color: #A1A1A1">Recent Notes</p>
		{#if notes.value.length > 0}
			<a
				href="/notes"
				class="text-xs font-semibold transition-colors hover:text-white"
				style="color: #CCFF00"
			>View all →</a>
		{/if}
	</div>

	{#if notes.value.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center" in:fade>
			<p class="text-sm" style="color: #A1A1A1">No notes yet.</p>
			<a
				href="/notes"
				class="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-80"
				style="background: #CCFF00; color: #000000;"
			>
				<Plus size={12} /> New Note
			</a>
		</div>
	{:else}
		<div class="space-y-1.5 flex-1">
			{#each notes.value.slice(-4).reverse() as note (note.id)}
				<a
					href="/notes"
					class="group block rounded-lg p-3 transition-all duration-150"
					style="border: 1px solid transparent;"
					onmouseenter={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
					onmouseleave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
					in:fly={{ y: 4, duration: 150 }}
				>
					<p class="line-clamp-1 text-sm text-white">{note.content}</p>
					<span class="mt-1 flex items-center gap-1 text-[11px]" style="color: #A1A1A1">
						<Clock size={9} />
						{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
					</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
