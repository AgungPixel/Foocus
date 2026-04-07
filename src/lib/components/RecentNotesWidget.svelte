<script lang="ts">
    import { fly } from 'svelte/transition';
    import { Clock, NotebookPen } from 'lucide-svelte';
    import { notes } from '$lib/stores/notesStore.svelte';
</script>

<div class="rounded-2xl border border-gray-800 bg-gray-900/30 p-6 lg:col-span-2 flex flex-col" in:fly={{ x: 20, duration: 400, delay: 400 }}>
    <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-gray-300 flex items-center"><Clock size={18} class="mr-2 text-purple-400"/> Recent Thoughts</h3>
        {#if notes.value.length > 0}
            <a href="/notes" class="text-xs text-purple-400 hover:text-purple-300 px-3 py-1 bg-purple-500/10 rounded-full hover:bg-purple-500/20 transition-colors">View All</a>
        {/if}
    </div>

    {#if notes.value.length === 0}
        <div class="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/20">
            <NotebookPen size={32} class="text-gray-600 mb-3" />
            <p class="text-gray-400 mb-4">Your canvas is empty.</p>
            <a href="/notes" class="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Start Writing</a>
        </div>
    {:else}
        <div class="space-y-3 flex-1">
            {#each notes.value.slice(-3).reverse() as note}
                <a href="/notes" class="group block p-4 rounded-xl border border-gray-800 bg-gray-800/30 hover:bg-gray-800 transition-colors">
                    <p class="text-gray-200 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{note.content}</p>
                    <div class="mt-3 flex items-center text-xs text-gray-500">
                        <Clock size={12} class="mr-1" />
                        {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>
