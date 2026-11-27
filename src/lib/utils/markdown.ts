import type { Block, BlockType, LegacyNote, NotePage } from '$lib/types';

export function createBlock(type: BlockType = 'paragraph', content = '', checked?: boolean): Block {
	return {
		id: crypto.randomUUID(),
		type,
		content,
		...(type === 'todo' ? { checked: Boolean(checked) } : {})
	};
}

/** Parse satu baris Markdown menjadi Block. */
export function parseMarkdownLine(line: string): Block {
	if (line.startsWith('## ')) {
		return createBlock('heading2', line.slice(3));
	}
	if (line.startsWith('# ')) {
		return createBlock('heading1', line.slice(2));
	}
	const todoChecked = line.match(/^-\s*\[[xX]\]\s*(.*)$/);
	if (todoChecked) {
		return createBlock('todo', todoChecked[1], true);
	}
	const todoUnchecked = line.match(/^(?:-\s*)?\[\s?\]\s*(.*)$/);
	if (todoUnchecked) {
		return createBlock('todo', todoUnchecked[1], false);
	}
	if (line.startsWith('- ') || line.startsWith('* ')) {
		return createBlock('bullet', line.slice(2));
	}
	return createBlock('paragraph', line);
}

/** Parse teks Markdown multi-baris menjadi daftar Block. */
export function markdownToBlocks(markdown: string): Block[] {
	const lines = markdown.replace(/\r\n/g, '\n').split('\n');
	// Hilangkan baris kosong di awal & akhir saja agar struktur paragraf terjaga
	while (lines.length > 1 && lines[0].trim() === '') lines.shift();
	while (lines.length > 1 && lines[lines.length - 1].trim() === '') lines.pop();

	if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
		return [createBlock('paragraph', '')];
	}
	return lines.map(parseMarkdownLine);
}

/** Ubah NotePage menjadi string Markdown yang rapi untuk copy/export/preview. */
export function blocksToMarkdown(note: Pick<NotePage, 'title' | 'blocks'>): string {
	const lines: string[] = [];
	const trimmedTitle = note.title.trim();

	if (trimmedTitle) {
		lines.push(`# ${trimmedTitle}`);
	}

	const bodyLines = note.blocks.map((block) => {
		switch (block.type) {
			case 'heading1':
				return `# ${block.content}`;
			case 'heading2':
				return `## ${block.content}`;
			case 'bullet':
				return `- ${block.content}`;
			case 'todo':
				return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
			default:
				return block.content;
		}
	});

	const hasBody = bodyLines.some((line) => line.trim() !== '');
	if (trimmedTitle && hasBody) {
		lines.push('');
	}
	if (hasBody || !trimmedTitle) {
		lines.push(...bodyLines);
	}

	return lines.join('\n').trimEnd();
}

/** Ambil ringkasan teks singkat untuk tampilan kartu di daftar Notes. */
export function getExcerpt(blocks: Block[], maxLength = 140): string {
	const joined = blocks
		.map((b) => b.content.trim())
		.filter(Boolean)
		.join(' · ');
	if (!joined) return '';
	if (joined.length <= maxLength) return joined;
	return `${joined.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Konversi catatan lama (My Notes) menjadi NotePage dengan ID deterministik. */
export function migrateLegacyNote(legacy: LegacyNote): NotePage {
	const lines = legacy.content.replace(/\r\n/g, '\n').split('\n');
	const firstNonEmptyIndex = lines.findIndex((l) => l.trim() !== '');

	let title = '';
	let bodyLines = lines;

	if (firstNonEmptyIndex !== -1) {
		const firstLine = lines[firstNonEmptyIndex].trim();
		if (firstLine.startsWith('# ')) {
			title = firstLine.slice(2).trim();
			bodyLines = lines.slice(firstNonEmptyIndex + 1);
		} else if (
			firstLine.length <= 80 &&
			!firstLine.startsWith('## ') &&
			!firstLine.startsWith('- ') &&
			!firstLine.startsWith('* ') &&
			!firstLine.startsWith('[] ') &&
			!firstLine.startsWith('- [')
		) {
			title = firstLine;
			bodyLines = lines.slice(firstNonEmptyIndex + 1);
		}
	}

	const blocks = markdownToBlocks(bodyLines.join('\n'));
	const timestamp = legacy.createdAt || new Date().toISOString();

	return {
		id: `legacy-note-${legacy.id}`,
		title,
		parentId: null,
		blocks,
		createdAt: timestamp,
		updatedAt: timestamp
	};
}

/** Sanitasi HTML hasil render Markdown agar aman dari XSS. */
export function sanitizeHtml(html: string): string {
	return html
		.replace(/<(script|iframe|object|embed|style|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/<(script|iframe|object|embed|style|form)\b[^>]*\/?>/gi, '')
		.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(
			/\s(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data:text\/html)[\s\S]*?\2/gi,
			' $1="#"'
		);
}
