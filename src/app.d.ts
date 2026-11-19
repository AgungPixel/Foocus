// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/** Bentuk minimal Cloudflare KV yang kita pakai (get & put). */
interface KVNamespaceLike {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				FOOCUS_KV: KVNamespaceLike;
			};
		}
	}
}

export {};
