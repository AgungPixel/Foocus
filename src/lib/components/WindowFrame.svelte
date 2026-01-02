<script>
	import { fly, fade } from 'svelte/transition';

	export let title = 'Window';
	export let isLocked = true;
	export let isFullscreen = false;

	let isClosed = false;

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	function closeWindow() {
		isClosed = true;
		// Dispatch event untuk parent
		dispatch('close');
	}

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
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
					on:click={() => (isLocked = !isLocked)}
					title={isLocked ? 'Unlock window' : 'Lock window'}
				>
					{#if isLocked}
						🔒
					{:else}
						🔓
					{/if}
				</button>

				<!-- Fullscreen Button -->
				<button
					class="rounded p-1 transition-colors hover:bg-gray-700"
					on:click={toggleFullscreen}
					title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
				>
					{#if isFullscreen}
						⤢
					{:else}
						⤢
					{/if}
				</button>

				<!-- Close Button -->
				<button
					class="rounded p-1 transition-colors hover:bg-red-600"
					on:click={closeWindow}
					title="Close window"
				>
					✕
				</button>
			</div>
		</div>

		<!-- Window Content -->
		<div class="flex-1 overflow-auto p-4">
			<slot />
		</div>
	</div>
{/if}
