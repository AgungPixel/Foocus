<script lang="ts">
    import { fly } from 'svelte/transition';
    import { CheckCircle2 } from 'lucide-svelte';
    import { todos } from '$lib/stores/todosStore.svelte';
    import { notes } from '$lib/stores/notesStore.svelte';
    import type { Todo } from '$lib/stores/todosStore.svelte';
</script>

<div class="rounded-2xl border border-gray-800 bg-gray-900/30 p-6 lg:col-span-1" in:fly={{ x: -20, duration: 400, delay: 300 }}>
    <h3 class="font-semibold text-gray-300 mb-6 flex items-center"><CheckCircle2 size={18} class="mr-2 text-green-400"/> Activity Overview</h3>
    
    <div class="space-y-6">
        <div>
            <div class="flex justify-between text-sm mb-2 text-gray-400">
                <span>Task Completion</span>
                <span class="font-bold text-white">
                    {todos.value.length ? Math.round((todos.value.filter((t: Todo) => t.completed).length / todos.value.length) * 100) : 0}%
                </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div 
                    class="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style="width: {todos.value.length ? (todos.value.filter((t: Todo) => t.completed).length / todos.value.length) * 100 : 0}%"
                ></div>
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div class="text-center p-3 rounded-xl bg-gray-800/50">
                <span class="block text-2xl font-bold text-white">{notes.value.length}</span>
                <span class="text-xs text-gray-400 uppercase tracking-wider">Total Notes</span>
            </div>
            <div class="text-center p-3 rounded-xl bg-gray-800/50">
                <span class="block text-2xl font-bold text-white">{todos.value.length}</span>
                <span class="text-xs text-gray-400 uppercase tracking-wider">Total Tasks</span>
            </div>
        </div>
    </div>
</div>
