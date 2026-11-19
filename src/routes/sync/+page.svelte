<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Cloud, CloudDownload, CloudUpload, Copy } from 'lucide-svelte';
	import { sync } from '$lib/stores/syncStore.svelte';

	let codeInput = $state('');

	async function copyCode() {
		await navigator.clipboard.writeText(sync.code);
	}

	async function pull() {
		if (confirm('Data di perangkat ini akan ditimpa oleh data dari cloud. Lanjutkan?')) {
			await sync.pull();
		}
	}

	async function push() {
		if (confirm('Data di cloud akan ditimpa oleh data dari perangkat ini. Lanjutkan?')) {
			await sync.push();
		}
	}
</script>

<div class="mx-auto max-w-xl space-y-6 pb-10" in:fade={{ duration: 300 }}>
	<div class="border-b pb-6" style="border-color: #1a1a1a">
		<h1 class="text-2xl font-bold text-white">Sync</h1>
		<p class="mt-1 text-sm" style="color: #A1A1A1">
			Samakan Tasks, Notes, dan Pages antar perangkat dengan satu kode sync.
		</p>
	</div>

	{#if !sync.code}
		<div class="space-y-4 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<p class="text-sm text-white">Perangkat pertama</p>
			<button
				onclick={() => sync.createCode()}
				class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
				style="background: #CCFF00; color: #000000;"
			>
				<Cloud size={15} /> Buat kode sync
			</button>
		</div>

		<div class="space-y-3 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<p class="text-sm text-white">Perangkat lain: masukkan kode yang sudah ada</p>
			<input
				bind:value={codeInput}
				placeholder="Tempel kode sync di sini"
				class="w-full rounded-lg bg-black px-3 py-2 text-sm text-white outline-none"
				style="border: 1px solid #1a1a1a;"
			/>
			<button
				onclick={() => sync.connect(codeInput)}
				disabled={codeInput.trim().length < 20}
				class="rounded-xl px-5 py-2.5 text-sm font-bold text-black disabled:opacity-30"
				style="background: #CCFF00;"
			>
				Hubungkan
			</button>
		</div>
	{:else}
		<div class="space-y-4 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<p class="text-xs font-semibold tracking-widest uppercase" style="color: #525252">Kode sync</p>
			<div class="flex items-center gap-2">
				<code class="flex-1 rounded-lg bg-black px-3 py-2 text-xs break-all text-white">{sync.code}</code>
				<button onclick={copyCode} aria-label="Copy code" style="color: #A1A1A1"><Copy size={16} /></button>
			</div>
			<p class="text-xs" style="color: #A1A1A1">
				Siapa pun yang punya kode ini bisa membaca dan menimpa data kamu. Jangan dibagikan.
			</p>

			<div class="flex flex-wrap gap-3">
				<button
					onclick={push}
					disabled={sync.busy}
					class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black disabled:opacity-30"
					style="background: #CCFF00;"
				>
					<CloudUpload size={15} /> Upload
				</button>
				<button
					onclick={pull}
					disabled={sync.busy}
					class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-30"
					style="border: 1px solid #333;"
				>
					<CloudDownload size={15} /> Download
				</button>
				<button onclick={() => sync.disconnect()} class="px-3 text-sm" style="color: #A1A1A1">Putuskan</button>
			</div>

			{#if sync.lastSync}
				<p class="text-xs" style="color: #A1A1A1">
					Terakhir sync: {new Date(sync.lastSync).toLocaleString()}
				</p>
			{/if}
		</div>
	{/if}

	{#if sync.message}
		<p class="text-sm" style="color: {sync.failed ? '#ff6b6b' : '#CCFF00'}">{sync.message}</p>
	{/if}
</div>
