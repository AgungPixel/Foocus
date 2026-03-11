<script>
	import { fly, fade } from 'svelte/transition';
	import { Lock, Unlock, Maximize, X } from 'lucide-svelte';

	let { title = 'Window', isLocked = $bindable(true), isFullscreen = $bindable(false), children, onclose = () => {} } = $props();

	let isClosed = $state(false);

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	function closeWindow() {
		isClosed = true;
		if (onclose) onclose();
	}
</script>

{#if !isClosed}
	<div
		class="flex flex-col {isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}  
            overflow-hidden rounded-lg shadow-xl transition-all duration-300"
		in:fly={{ y: 30, duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<!-- Window Header -->
		<div class="flex items-center justify-between bg-black p-4 text-white">
			<h2 class="font-semibold">{title}</h2>

			<!-- Window Controls -->
			<div class="flex items-center space-x-2">
				<!-- Lock Button -->
				<button
					class="rounded p-1 transition-colors hover:bg-gray-700"
					onclick={() => (isLocked = !isLocked)}
					title={isLocked ? 'Unlock window' : 'Lock window'}
					aria-label={isLocked ? 'Unlock window' : 'Lock window'}
				>
					{#if isLocked}
						<Lock size={16} />
					{:else}
						<Unlock size={16} />
					{/if}
				</button>

				<!-- Fullscreen Button -->
				<button
					class="rounded p-1 transition-colors hover:bg-gray-700"
					onclick={toggleFullscreen}
					title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
					aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
				>
					<Maximize size={16} />
				</button>

				<!-- Close Button -->
				<button
					class="rounded p-1 transition-colors hover:bg-red-600"
					onclick={closeWindow}
					title="Close window"
					aria-label="Close window"
				>
					<X size={16} />
				</button>
			</div>
		</div>

		<!-- Window Content -->
		<div class="flex-1 overflow-auto p-4">
			{@render children?.()}
		</div>
	</div>
{/if}
