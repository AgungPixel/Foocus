<script>
	import WindowFrame from '$lib/components/WindowFrame.svelte';
	import { notes } from '$lib/stores/notesStore';
	import { fade } from 'svelte/transition';

	let newNote = '';

	function addNote() {
		if (newNote.trim()) {
			notes.addNote(newNote.trim());
			newNote = '';
		}
	}

	function downloadNote(content, index) {
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

	function copyToClipboard(text) {
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
						on:click={addNote}
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
				<h3 class="text-xl font-semibold">Your Notes ({$notes.length})</h3>
				{#if $notes.length > 0}
					<button
						on:click={() => notes.clearAll()}
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Clear All
					</button>
				{/if}
			</div>

			{#if $notes.length === 0}
				<p class="py-8 text-center text-gray-500">No notes yet. Create your first note above!</p>
			{:else}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each $notes as note, i}
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
										on:click={() => copyToClipboard(note.content)}
										class="rounded bg-gray-800 px-3 py-1 text-white transition-colors hover:bg-gray-700"
										title="Copy note"
									>
										📋 Copy
									</button>

									<button
										on:click={() => downloadNote(note.content, i)}
										class="rounded bg-black px-3 py-1 text-white transition-colors hover:bg-gray-800"
										title="Download note"
									>
										⬇️ Download
									</button>

									<button
										on:click={() => notes.deleteNote(note.id)}
										class="rounded bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
										title="Delete note"
									>
										🗑️
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
