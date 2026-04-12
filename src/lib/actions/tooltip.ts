/**
 * Svelte action: renders a fixed tooltip appended to document.body.
 * Avoids all overflow/clipping issues from parent containers.
 *
 * Usage:
 *   <element use:tooltip={{ label: 'My Label', disabled: false }}>
 */

interface TooltipOptions {
	label: string;
	disabled?: boolean;
}

export function tooltip(node: HTMLElement, options: TooltipOptions) {
	let el: HTMLDivElement | null = null;

	function create() {
		el = document.createElement('div');
		el.textContent = options.label;
		el.style.cssText = `
			position: fixed;
			z-index: 9999;
			padding: 5px 10px;
			background: #1a1a1a;
			border: 1px solid #333;
			border-radius: 6px;
			font-size: 12px;
			font-weight: 500;
			color: #ffffff;
			box-shadow: 0 4px 16px rgba(0,0,0,0.6);
			pointer-events: none;
			white-space: nowrap;
			opacity: 0;
			transition: opacity 0.15s ease;
		`;
		document.body.appendChild(el);
	}

	function position() {
		if (!el) return;
		const rect = node.getBoundingClientRect();
		el.style.top = `${rect.top + rect.height / 2 - el.offsetHeight / 2}px`;
		el.style.left = `${rect.right + 10}px`;
	}

	function show() {
		if (options.disabled || !el) return;
		position();
		el.style.opacity = '1';
	}

	function hide() {
		if (!el) return;
		el.style.opacity = '0';
	}

	function attach() {
		create();
		node.addEventListener('mouseenter', show);
		node.addEventListener('mouseleave', hide);
	}

	function detach() {
		hide();
		node.removeEventListener('mouseenter', show);
		node.removeEventListener('mouseleave', hide);
		el?.remove();
		el = null;
	}

	if (!options.disabled) attach();

	return {
		update(newOptions: TooltipOptions) {
			options = newOptions;
			if (options.disabled) {
				if (el) detach();
			} else if (!el) {
				attach();
			} else {
				el.textContent = options.label;
			}
		},
		destroy() {
			detach();
		}
	};
}
