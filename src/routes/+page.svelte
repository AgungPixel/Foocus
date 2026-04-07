<script lang="ts">
	import WindowFrame from '$lib/components/WindowFrame.svelte';
	import QuickActionCard from '$lib/components/QuickActionCard.svelte';
	import StatsWidget from '$lib/components/StatsWidget.svelte';
	import RecentNotesWidget from '$lib/components/RecentNotesWidget.svelte';
	import { notes } from '$lib/stores/notesStore.svelte';
	import { todos } from '$lib/stores/todosStore.svelte';
	import { fade, fly } from 'svelte/transition';

	import type { Todo } from '$lib/stores/todosStore.svelte';
	import { Sparkles, NotebookPen, ListTodo } from 'lucide-svelte';
	
	let greeting = $state('Welcome');
	let timeString = $state('');
	
	$effect(() => {
		const updateTimeAndGreeting = () => {
			const now = new Date();
			const hour = now.getHours();
			if (hour < 12) greeting = 'Good Morning';
			else if (hour < 18) greeting = 'Good Afternoon';
			else greeting = 'Good Evening';
			
			timeString = now.toLocaleTimeString(undefined, {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
		};
		updateTimeAndGreeting();
		const interval = setInterval(updateTimeAndGreeting, 1000);
		
		return () => clearInterval(interval);
	});
</script>

<WindowFrame title="">
	<div class="space-y-8 pb-8">
		<!-- Hero Section / Welcome Header -->
		<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 shadow-2xl" in:fade={{ duration: 600 }}>
			<div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
			<div class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
			
			<div class="relative z-10">
				<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div>
						<div class="flex items-center gap-3 text-purple-300 mb-2">
							<Sparkles size={20} class="animate-pulse" />
							<span class="font-medium tracking-wide uppercase text-sm">Welcome Back</span>
						</div>
						<h1 class="text-4xl md:text-5xl font-extrabold text-white mb-2">
							{greeting}, <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Creator.</span>
						</h1>
						<p class="text-indigo-200 mt-4 max-w-lg text-lg">
							Get ready to conquer your day. You have <strong class="text-white">{todos.value.filter((t: Todo) => !t.completed).length} pending tasks</strong> dan <strong class="text-white">{notes.value.length} notes</strong> capturing your thoughts.
						</p>
					</div>

					{#if timeString}
						<div class="mt-6 md:mt-0 text-center md:text-right" in:fade>
							<div class="text-4xl md:text-5xl font-bold text-white tracking-widest bg-black/30 backdrop-blur-sm rounded-xl py-3 px-6 shadow-inner border border-purple-500/30 inline-block font-mono">
								{timeString}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Quick Actions - Glassmorphic Cards -->
			{#snippet noteIcon(extraClass: string, size: number)}
				<NotebookPen class={extraClass} {size} />
			{/snippet}

			<QuickActionCard
				href="/notes"
				title="Capture Ideas"
				description="Write down your thoughts, code snippets, or journal entries instantly."
				linkText="Go to Notes"
				iconBgClass="bg-purple-500/10"
				iconColorClass="text-purple-400"
				iconBoxClass="bg-purple-500/20"
				hoverShadowClass="hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
				delay={100}
				icon={noteIcon}
			/>

			{#snippet todoIcon(extraClass: string, size: number)}
				<ListTodo class={extraClass} {size} />
			{/snippet}

			<QuickActionCard
				href="/todos"
				title="Plan Tasks"
				description="Organize your workflow and check off completed items to stay productive."
				linkText="Go to Tasks"
				iconBgClass="bg-blue-500/10"
				iconColorClass="text-blue-400"
				iconBoxClass="bg-blue-500/20"
				hoverShadowClass="hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]"
				delay={200}
				icon={todoIcon}
			/>
		</div>

		<!-- Dashboard Bottom Section -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			
			<!-- Stats Widget -->
			<StatsWidget />

			<!-- Recent Notes Widget -->
			<RecentNotesWidget />
			
		</div>
	</div>
</WindowFrame>

