<script>
	let { title = 'Window', children } = $props();
</script>

	<div class="flex h-full flex-col overflow-hidden rounded-lg shadow-xl transition-all duration-300">
		<!-- Window Header -->
		<div class="flex items-center justify-between bg-black p-4 text-white">
			<h2 class="font-semibold">{title}</h2>
		</div>

		<!-- Window Content -->
		<div class="flex-1 overflow-auto p-4">
			{@render children?.()}
		</div>
	</div>
