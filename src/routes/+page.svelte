<script lang="ts">
	import WindowFrame from '$lib/components/WindowFrame.svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { todos } from '$lib/stores/todosStore.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import type { Note } from '$lib/stores/notesStore.svelte';
	import type { Todo } from '$lib/stores/todosStore.svelte';
	import { NotebookPen, ListTodo, Sparkles, Clock, CheckCircle2, ChevronRight } from 'lucide-svelte';
	
	let greeting = $derived(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good Morning';
		if (hour < 18) return 'Good Afternoon';
		return 'Good Evening';
	});
</script>

<WindowFrame title="Dashboard">
	<div class="space-y-8 pb-8">
		<!-- Hero Section / Welcome Header -->
		<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 shadow-2xl" in:fade={{ duration: 600 }}>
			<div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
			<div class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
			
			<div class="relative z-10">
				<div class="flex items-center gap-3 text-purple-300 mb-2">
					<Sparkles size={20} class="animate-pulse" />
					<span class="font-medium tracking-wide uppercase text-sm">Welcome Back</span>
				</div>
				<h1 class="text-4xl md:text-5xl font-extrabold text-white mb-2">
					{greeting()}, <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Creator.</span>
				</h1>
				<p class="text-indigo-200 mt-4 max-w-lg text-lg">
					Get ready to conquer your day. You have <strong class="text-white">{todos.value.filter((t: Todo) => !t.completed).length} pending tasks</strong> and <strong class="text-white">{notes.value.length} notes</strong> capturing your thoughts.
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Quick Actions - Glassmorphic Cards -->
			<a
				href="/notes"
				class="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-gray-800/80 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
				in:fly={{ y: 20, duration: 400, delay: 100 }}
			>
				<div class="absolute -right-4 -top-4 rounded-full bg-purple-500/10 p-8 transition-transform duration-500 group-hover:scale-150">
					<NotebookPen class="text-purple-400 opacity-50" size={48} />
				</div>
				<div class="relative z-10">
					<div class="mb-4 inline-flex rounded-xl bg-purple-500/20 p-3 text-purple-400">
						<NotebookPen size={28} />
					</div>
					<h3 class="text-xl font-bold text-white mb-2">Capture Ideas</h3>
					<p class="text-gray-400">Write down your thoughts, code snippets, or journal entries instantly.</p>
					<div class="mt-6 flex items-center text-sm font-semibold text-purple-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
						Go to Notes <ChevronRight size={16} class="ml-1" />
					</div>
				</div>
			</a>

			<a
				href="/todos"
				class="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-gray-800/80 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
				in:fly={{ y: 20, duration: 400, delay: 200 }}
			>
				<div class="absolute -right-4 -bottom-4 rounded-full bg-blue-500/10 p-8 transition-transform duration-500 group-hover:scale-150">
					<ListTodo class="text-blue-400 opacity-50" size={48} />
				</div>
				<div class="relative z-10">
					<div class="mb-4 inline-flex rounded-xl bg-blue-500/20 p-3 text-blue-400">
						<ListTodo size={28} />
					</div>
					<h3 class="text-xl font-bold text-white mb-2">Plan Tasks</h3>
					<p class="text-gray-400">Organize your workflow and check off completed items to stay productive.</p>
					<div class="mt-6 flex items-center text-sm font-semibold text-blue-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
						Go to Tasks <ChevronRight size={16} class="ml-1" />
					</div>
				</div>
			</a>
		</div>

		<!-- Dashboard Bottom Section -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			
			<!-- Stats Widget -->
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

			<!-- Recent Notes Widget -->
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
			
		</div>
	</div>
</WindowFrame>

