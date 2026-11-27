import { describe, expect, it } from 'vitest';
import {
	blocksToMarkdown,
	getExcerpt,
	markdownToBlocks,
	migrateLegacyNote,
	sanitizeHtml
} from './markdown';

describe('markdown helpers', () => {
	it('parses markdown lines into structured blocks', () => {
		const blocks = markdownToBlocks(
			'# Heading\n## Sub\n- Item A\n[] Todo 1\n- [x] Todo 2\nPlain text'
		);
		expect(blocks.map((b) => b.type)).toEqual([
			'heading1',
			'heading2',
			'bullet',
			'todo',
			'todo',
			'paragraph'
		]);
		expect(blocks[0].content).toBe('Heading');
		expect(blocks[3].checked).toBe(false);
		expect(blocks[4].checked).toBe(true);
		expect(blocks[5].content).toBe('Plain text');
	});

	it('serializes NotePage back to clean markdown', () => {
		const md = blocksToMarkdown({
			title: 'Sprint Plan',
			blocks: [
				{ id: '1', type: 'heading2', content: 'Goals' },
				{ id: '2', type: 'bullet', content: 'Ship sync' },
				{ id: '3', type: 'todo', content: 'Write tests', checked: true }
			]
		});
		expect(md).toBe('# Sprint Plan\n\n## Goals\n- Ship sync\n- [x] Write tests');
	});

	it('migrates legacy notes deterministically with title extraction', () => {
		const migrated = migrateLegacyNote({
			id: 1700000000,
			content: '# Meeting Notes\n- Point 1\n- Point 2',
			createdAt: '2026-01-01T00:00:00.000Z'
		});
		expect(migrated.id).toBe('legacy-note-1700000000');
		expect(migrated.title).toBe('Meeting Notes');
		expect(migrated.parentId).toBeNull();
		expect(migrated.blocks).toHaveLength(2);
		expect(migrated.blocks[0].type).toBe('bullet');
	});

	it('extracts truncated excerpt and strips dangerous html', () => {
		const excerpt = getExcerpt([
			{ id: '1', type: 'paragraph', content: 'First line' },
			{ id: '2', type: 'paragraph', content: 'Second line' }
		]);
		expect(excerpt).toBe('First line · Second line');

		const safe = sanitizeHtml(
			'<p onclick="alert(1)">Hi</p><script>evil()</script><a href="javascript:alert(2)">x</a>'
		);
		expect(safe).not.toContain('onclick');
		expect(safe).not.toContain('<script>');
		expect(safe).not.toContain('javascript:');
	});
});
