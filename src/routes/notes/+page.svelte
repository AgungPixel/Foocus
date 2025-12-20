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
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 class="text-xl font-semibold mb-4">Create New Note</h3>
      <div class="space-y-4">
        <textarea
          bind:value={newNote}
          placeholder="Type your note here..."
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          rows="4"></textarea>
        
        <div class="flex justify-end">
          <button 
            on:click={addNote}
            class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newNote.trim()}>
            Save Note
          </button>
        </div>
      </div>
    </div>
    
    <!-- Notes List -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Your Notes ({$notes.length})</h3>
        {#if $notes.length > 0}
          <button 
            on:click={() => notes.clearAll()}
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Clear All
          </button>
        {/if}
      </div>
      
      {#if $notes.length === 0}
        <p class="text-gray-500 text-center py-8">No notes yet. Create your first note above!</p>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each $notes as note, i}
            <div 
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              in:fade={{ duration: 300 }}>
              
              <p class="mb-3 whitespace-pre-wrap">{note.content}</p>
              
              <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span class="text-sm text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                
                <div class="flex space-x-2">
                  <button 
                    on:click={() => copyToClipboard(note.content)}
                    class="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                    title="Copy note">
                    📋 Copy
                  </button>
                  
                  <button 
                    on:click={() => downloadNote(note.content, i)}
                    class="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                    title="Download note">
                    ⬇️ Download
                  </button>
                  
                  <button 
                    on:click={() => notes.deleteNote(note.id)}
                    class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Delete note">
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