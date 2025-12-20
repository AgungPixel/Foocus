<script lang="ts">
  import WindowFrame from '$lib/components/WindowFrame.svelte';
  import { notes } from '$lib/stores/notesStore';
  import { todos } from '$lib/stores/todosStore';

  // Tambahkan interface
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: string;
  }

</script>

<WindowFrame title="Dashboard" isLocked={true}>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-black">Simple Notes & Todo App</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Stats -->
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 class="text-xl font-semibold mb-4">📊 Statistics</h3>
        <div class="space-y-2">
          <p>Total Notes: {$notes.length}</p>
          <p>Total Todos: {$todos.length}</p>
          <p>Completed Todos: {$todos.filter((t: Todo) => t.completed).length}</p>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 class="text-xl font-semibold mb-4">⚡ Quick Actions</h3>
        <div class="space-y-2">
          <a href="/notes" class="block p-3 bg-black text-white rounded hover:bg-gray-800 transition-colors">
            Create New Note
          </a>
          <a href="/todos" class="block p-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
            Add New Todo
          </a>
        </div>
      </div>
    </div>
    
    <!-- Recent Notes -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 class="text-xl font-semibold mb-4">📝 Recent Notes</h3>
      {#if $notes.length === 0}
        <p class="text-gray-500">No notes yet. Create your first note!</p>
      {:else}
        <div class="space-y-3">
          {#each $notes.slice(-3).reverse() as note}
            <div class="p-3 border border-gray-200 rounded">
              <p class="truncate">{note.content.substring(0, 100)}...</p>
              <p class="text-sm text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</WindowFrame>