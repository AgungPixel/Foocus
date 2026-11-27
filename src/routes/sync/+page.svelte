<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Check, Cloud, Copy, RefreshCw } from 'lucide-svelte';
	import { sync } from '$lib/stores/syncStore.svelte';

	let codeInput = $state('');
	let copied = $state(false);

	async function copyCode() {
		await navigator.clipboard.writeText(sync.code);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="mx-auto max-w-xl space-y-6 pb-10" in:fade={{ duration: 300 }}>
	<div class="border-b pb-6" style="border-color: #1a1a1a">
		<h1 class="text-2xl font-bold text-white">Sync</h1>
		<p class="mt-1 text-sm" style="color: #A1A1A1">
			Samakan Tasks dan Notes antar perangkat secara otomatis dengan Smart Merge.
		</p>
	</div>

	{#if !sync.code}
		<div class="space-y-4 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<p class="text-sm text-white">Perangkat pertama</p>
			<p class="text-xs" style="color: #A1A1A1">
				Buat kode sync unik untuk mulai menyinkronkan data ke Cloudflare KV secara gratis.
			</p>
			<button
				onclick={() => sync.createCode()}
				class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
				style="background: #CCFF00;"
			>
				<Cloud size={15} /> Buat kode sync
			</button>
		</div>

		<div class="space-y-3 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<p class="text-sm text-white">Perangkat lain: masukkan kode yang sudah ada</p>
			<input
				bind:value={codeInput}
				placeholder="Tempel kode sync di sini"
				class="w-full rounded-lg bg-black px-3 py-2 text-sm text-white transition-colors outline-none"
				style="border: 1px solid #1a1a1a;"
				onfocus={(e) => (e.currentTarget.style.borderColor = '#CCFF00')}
				onblur={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
			/>
			<button
				onclick={() => sync.connect(codeInput)}
				disabled={codeInput.trim().length < 20}
				class="rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-opacity disabled:opacity-30"
				style="background: #CCFF00;"
			>
				Hubungkan
			</button>
		</div>
	{:else}
		<div class="space-y-5 rounded-xl p-5" style="background: #0A0A0A; border: 1px solid #1a1a1a;">
			<div class="space-y-2">
				<p class="text-xs font-semibold tracking-widest uppercase" style="color: #525252">
					Kode sync
				</p>
				<div class="flex items-center gap-2">
					<code class="flex-1 rounded-lg bg-black px-3 py-2 text-xs break-all text-white">
						{sync.code}
					</code>
					<button
						onclick={copyCode}
						aria-label="Copy code"
						class="rounded-lg p-2 transition-colors hover:bg-white/5"
						style="color: {copied ? '#CCFF00' : '#A1A1A1'}"
					>
						{#if copied}
							<Check size={16} />
						{:else}
							<Copy size={16} />
						{/if}
					</button>
				</div>
				<p class="text-xs" style="color: #A1A1A1">
					Siapa pun yang punya kode ini bisa mengakses dan menggabungkan data kamu. Jangan
					dibagikan.
				</p>
			</div>

			<!-- Auto-Sync Toggle -->
			<div class="flex items-center justify-between border-y py-3" style="border-color: #1a1a1a">
				<div>
					<p class="text-sm text-white">Auto-sync</p>
					<p class="text-xs" style="color: #A1A1A1">
						Gabungkan perubahan otomatis setelah edit &amp; saat membuka aplikasi.
					</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={sync.autoSync}
					aria-label="Toggle auto-sync"
					onclick={() => sync.setAutoSync(!sync.autoSync)}
					class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
					style="background: {sync.autoSync ? '#CCFF00' : '#1a1a1a'};"
				>
					<span
						class="block h-4 w-4 rounded-full transition-transform {sync.autoSync
							? 'translate-x-6 bg-black'
							: 'translate-x-1 bg-[#A1A1A1]'}"
					></span>
				</button>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<button
					onclick={() => sync.syncNow({ silent: false })}
					disabled={sync.status === 'syncing'}
					class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-opacity disabled:opacity-40"
					style="background: #CCFF00;"
				>
					<RefreshCw size={15} class={sync.status === 'syncing' ? 'animate-spin' : ''} />
					{sync.status === 'syncing' ? 'Syncing…' : 'Sync Now'}
				</button>
				<button
					onclick={() => sync.disconnect()}
					class="px-3 py-2 text-sm transition-colors hover:text-white"
					style="color: #A1A1A1"
				>
					Putuskan
				</button>
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
