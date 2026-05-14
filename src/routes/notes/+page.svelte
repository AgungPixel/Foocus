<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import 'easymde/dist/easymde.min.css';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { fade } from 'svelte/transition';
	import { Copy, Download, Trash2, Plus } from 'lucide-svelte';

	let newNote = $state('');
	let copied = $state<number | null>(null);
	let textareaElement: HTMLTextAreaElement;
	let mde: any;

	onMount(async () => {
		if (browser) {
			const EasyMDE = (await import('easymde')).default;
			mde = new EasyMDE({
				element: textareaElement,
				toolbar: [
					"bold", "italic", "strikethrough", "|",
					{ name: "heading-1", action: EasyMDE.toggleHeading1, className: "fa h1-text", title: "Heading 1" },
					{ name: "heading-2", action: EasyMDE.toggleHeading2, className: "fa h2-text", title: "Heading 2" },
					{ name: "heading-3", action: EasyMDE.toggleHeading3, className: "fa h3-text", title: "Heading 3" },
					"|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview"
				],
				hideIcons: ["guide", "fullscreen", "side-by-side"],
				spellChecker: false,
				status: false,
				placeholder: "Write your markdown notes here...",
				forceSync: true,
				previewRender: (plainText) => {
					return '<div class="prose prose-invert prose-sm max-w-none markdown-body pl-2 pr-2 pt-1 pb-1">' + marked.parse(plainText) + '</div>';
				}
			});

			mde.codemirror.on("change", () => {
				newNote = mde.value();
			});
		}
	});

	function addNote() {
		if (newNote.trim()) {
			notes.addNote(newNote.trim());
			newNote = '';
			if (mde) mde.value('');
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

	async function copyToClipboard(text: string, id: number) {
		await navigator.clipboard.writeText(text);
		copied = id;
		setTimeout(() => (copied = null), 1500);
	}
</script>

<div class="space-y-6 pb-10" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="border-b pb-6" style="border-color: #1a1a1a">
		<h1 class="text-2xl font-bold text-white">Notes</h1>
		<p class="mt-1 text-sm" style="color: #A1A1A1">{notes.value.length} note{notes.value.length !== 1 ? 's' : ''}</p>
	</div>

	<!-- Input -->
	<div class="space-y-3">
		<!-- EasyMDE wrapper -->
		<div class="easymde-dark-override" style="--easymde-border: #1a1a1a; --easymde-bg: #0A0A0A;">
			<textarea bind:this={textareaElement}></textarea>
		</div>
		<div class="flex justify-end">
			<button
				onclick={addNote}
				disabled={!newNote.trim()}
				class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-opacity disabled:opacity-30"
				style="background: #CCFF00; color: #000000;"
			>
				<Plus size={15} /> Save Note
			</button>
		</div>
	</div>

	<!-- Notes list -->
	{#if notes.value.length === 0}
		<div class="py-16 text-center" in:fade>
			<p class="text-sm" style="color: #A1A1A1">No notes yet.</p>
		</div>
	{:else}
		<div class="space-y-3">
			<!-- Clear All -->
			<div class="flex justify-end">
				<button
					onclick={() => notes.clearAll()}
					class="text-xs transition-colors"
					style="color: #A1A1A1"
					onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
					onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
				>
					Clear all
				</button>
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				{#each notes.value as note, i}
					<div
						class="flex flex-col rounded-xl p-4"
						style="background: #0A0A0A; border: 1px solid #1a1a1a;"
						in:fade={{ duration: 250 }}
					>
						<div class="prose prose-invert prose-sm max-w-none flex-1 leading-relaxed markdown-body">
							{@html marked(note.content)}
						</div>
						<div class="mt-4 flex items-center justify-between border-t pt-3" style="border-color: #1a1a1a">
							<span class="text-[11px]" style="color: #A1A1A1">
								{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
							</span>
							<div class="flex gap-1">
								<button
									onclick={() => copyToClipboard(note.content, note.id)}
									class="rounded-lg p-1.5 text-xs transition-colors"
									style={copied === note.id ? 'color: #CCFF00' : 'color: #A1A1A1'}
									title="Copy"
									aria-label="Copy note"
								>
									<Copy size={14} />
								</button>
								<button
									onclick={() => downloadNote(note.content, i)}
									class="rounded-lg p-1.5 transition-colors"
									style="color: #A1A1A1"
									onmouseenter={(e) => (e.currentTarget.style.color = '#CCFF00')}
									onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
									title="Download"
									aria-label="Download note"
								>
									<Download size={14} />
								</button>
								<button
									onclick={() => notes.deleteNote(note.id)}
									class="rounded-lg p-1.5 transition-colors"
									style="color: #A1A1A1"
									onmouseenter={(e) => (e.currentTarget.style.color = '#ff4444')}
									onmouseleave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
									title="Delete"
									aria-label="Delete note"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
