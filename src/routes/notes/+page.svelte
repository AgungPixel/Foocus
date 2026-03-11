<script lang="ts">
	import WindowFrame from '$lib/components/WindowFrame.svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { fade } from 'svelte/transition';
	import { Copy, Download, Trash2 } from 'lucide-svelte';

	let newNote = '';

	function addNote() {
		if (newNote.trim()) {
			notes.addNote(newNote.trim());
			newNote = '';
		}
	}

	function downloadNote(content: string, index: number) {
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `note-${index + 1}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert('Note copied to clipboard!');
		});
	}
</script>

<WindowFrame title="Notes Manager" isLocked={true}>
	<div class="space-y-6">
		<!-- Add New Note -->
		<div class="rounded-lg border border-surface-950 bg-surface-950 p-6 shadow">
			<h3 class="mb-4 text-xl font-semibold">Create New Note</h3>
			<div class="space-y-4">
				<textarea
					bind:value={newNote}
					placeholder="Type your note here..."
					class="w-full rounded-lg border border-surface-950 bg-surface-950 p-3 focus:border-transparent focus:ring-2 focus:ring-black"
					rows="4"
				></textarea>

				<div class="flex justify-end">
					<button
						onclick={addNote}
						class="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800
                   disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!newNote.trim()}
					>
						Save Note
					</button>
				</div>
			</div>
		</div>

		<!-- Notes List -->
		<div class="rounded-lg border border-surface-950 bg-surface-950 p-6 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-semibold">Your Notes ({notes.value.length})</h3>
				{#if notes.value.length > 0}
					<button
						onclick={() => notes.clearAll()}
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Clear All
					</button>
				{/if}
			</div>

			{#if notes.value.length === 0}
				<p class="py-8 text-center text-gray-500">No notes yet. Create your first note above!</p>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each notes.value as note, i}
						<div
							class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
							in:fade={{ duration: 300 }}
						>
							<p class="mb-3 whitespace-pre-wrap">{note.content}</p>

							<div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
								<span class="text-sm text-gray-500">
									{new Date(note.createdAt).toLocaleDateString()}
								</span>

								<div class="flex space-x-2">
									<button
										onclick={() => copyToClipboard(note.content)}
										class="flex items-center gap-1 rounded bg-gray-800 px-3 py-1 text-white transition-colors hover:bg-gray-700"
										title="Copy note"
										aria-label="Copy note"
									>
										<Copy size={16} /> Copy
									</button>

									<button
										onclick={() => downloadNote(note.content, i)}
										class="flex items-center gap-1 rounded bg-black px-3 py-1 text-white transition-colors hover:bg-gray-800"
										title="Download note"
										aria-label="Download note"
									>
										<Download size={16} /> Download
									</button>

									<button
										onclick={() => notes.deleteNote(note.id)}
										class="flex items-center justify-center rounded bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
										title="Delete note"
										aria-label="Delete note"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</WindowFrame>
