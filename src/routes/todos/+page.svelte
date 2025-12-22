<script>
  import WindowFrame from '$lib/components/WindowFrame.svelte';
  import { todos } from '$lib/stores/todosStore';
  import { fly, fade } from 'svelte/transition';
  
  let newTodoText = '';
  
  function addTodo() {
    if (newTodoText.trim()) {
      todos.addTodo(newTodoText.trim());
      newTodoText = '';
    }
  }
  
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  }
</script>

<WindowFrame title="To-Do List Manager" isLocked={true}>
  <div class="space-y-6">
    <!-- Add New Todo -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 class="text-xl font-semibold mb-4">➕ Add New Task</h3>
      <div class="flex gap-3">
        <input
          type="text"
          bind:value={newTodoText}
          on:keydown={handleKeyPress}
          placeholder="What needs to be done? (Press Enter to save)"
          class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-surface-950" />
        
        <button 
          on:click={addTodo}
          class="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newTodoText.trim()}>
          Add
        </button>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-black">{$todos.length}</p>
          <p class="text-sm text-gray-500">Total</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-green-600">{$todos.filter(t => t.completed).length}</p>
          <p class="text-sm text-gray-500">Completed</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-red-600">{$todos.filter(t => !t.completed).length}</p>
          <p class="text-sm text-gray-500">Pending</p>
        </div>
      </div>
    </div>
    
    <!-- Todo List -->
    <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Your Tasks ({$todos.length})</h3>
        {#if $todos.filter(t => t.completed).length > 0}
          <button 
            on:click={() => todos.clearCompleted()}
            class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Clear Completed
          </button>
        {/if}
      </div>
      
      {#if $todos.length === 0}
        <div class="text-center py-8" in:fade>
          <p class="text-gray-500 text-lg">🎉 No tasks yet! Add your first task above.</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each $todos as todo (todo.id)}
            <div 
              class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all
                     {todo.completed ? 'bg-gray-50 opacity-80' : ''}"
              in:fly={{ y: 20, duration: 300 }}
              out:fade>
              
              <!-- Checkbox -->
              <input
                type="checkbox"
                checked={todo.completed}
                on:change={() => todos.toggleTodo(todo.id)}
                class="h-5 w-5 rounded border-gray-300 text-black focus:ring-black" />
              
              <!-- Todo Text -->
              <div class="flex-1">
                <p class="{todo.completed ? 'line-through text-gray-500' : 'text-black'}">
                  {todo.text}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  Added: {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <!-- Delete Button -->
              <button 
                on:click={() => todos.deleteTodo(todo.id)}
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete task">
                🗑️
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Tips -->
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 class="font-semibold mb-2">💡 Tips:</h4>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>• Click checkbox to mark as complete</li>
        <li>• Press <kbd class="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> to quickly add tasks</li>
        <li>• Tasks are automatically saved in your browser</li>
        <li>• Use "Clear Completed" to remove finished tasks</li>
      </ul>
    </div>
  </div>
</WindowFrame>