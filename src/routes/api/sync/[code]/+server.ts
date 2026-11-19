import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Kode sync harus panjang & acak (mis. UUID) karena kode inilah satu-satunya "password".
const CODE_PATTERN = /^[A-Za-z0-9-]{20,64}$/;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function getStorage(platform: App.Platform | undefined, code: string) {
	if (!CODE_PATTERN.test(code)) error(400, 'Kode sync tidak valid');
	const kv = platform?.env?.FOOCUS_KV;
	if (!kv) error(500, 'Penyimpanan cloud (KV) belum dikonfigurasi');
	return { kv, key: `sync:${code}` };
}

export const GET: RequestHandler = async ({ params, platform }) => {
	const { kv, key } = getStorage(platform, params.code);
	const raw = await kv.get(key);
	if (!raw) error(404, 'Belum ada data untuk kode ini');
	return new Response(raw, { headers: { 'content-type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ params, platform, request }) => {
	const { kv, key } = getStorage(platform, params.code);
	const body = await request.text();

	if (body.length > MAX_BYTES) error(413, 'Data terlalu besar');
	try {
		JSON.parse(body);
	} catch {
		error(400, 'Data bukan JSON yang valid');
	}

	await kv.put(key, body);
	return json({ ok: true, savedAt: new Date().toISOString() });
};
