/**
 * Svelte action: membuat <textarea> otomatis menyesuaikan tinggi dengan isinya.
 *
 * Usage:
 *   <textarea use:autoresize={value}></textarea>
 */
export function autoresize(node: HTMLTextAreaElement, _value?: string) {
	function resize() {
		node.style.height = 'auto';
		node.style.height = `${node.scrollHeight}px`;
	}

	resize();
	node.addEventListener('input', resize);

	return {
		// Dipanggil setiap kali nilai `_value` berubah (mis. diubah lewat shortcut markdown)
		update: resize,
		destroy() {
			node.removeEventListener('input', resize);
		}
	};
}
