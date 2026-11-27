import { describe, expect, it } from 'vitest';
import type { Todo } from '$lib/types';
import { mergeRecords, normalizeSnapshot, pruneTombstones, snapshotsEqual } from './syncMerge';

describe('syncMerge', () => {
	it('merges concurrent edits across two devices without overwriting', () => {
		const local: Todo[] = [
			{
				id: 'a',
				text: 'Edited on phone',
				completed: false,
				createdAt: '2026-01-01T10:00:00.000Z',
				updatedAt: '2026-01-01T10:05:00.000Z'
			},
			{
				id: 'b',
				text: 'New local todo',
				completed: false,
				createdAt: '2026-01-01T10:06:00.000Z',
				updatedAt: '2026-01-01T10:06:00.000Z'
			}
		];

		const remote: Todo[] = [
			{
				id: 'a',
				text: 'Old on laptop',
				completed: false,
				createdAt: '2026-01-01T10:00:00.000Z',
				updatedAt: '2026-01-01T10:01:00.000Z'
			},
			{
				id: 'c',
				text: 'New remote todo',
				completed: true,
				createdAt: '2026-01-01T10:04:00.000Z',
				updatedAt: '2026-01-01T10:04:00.000Z'
			}
		];

		const merged = mergeRecords(local, remote);
		expect(merged).toHaveLength(3);
		expect(merged.find((t) => t.id === 'a')?.text).toBe('Edited on phone');
		expect(merged.find((t) => t.id === 'b')?.text).toBe('New local todo');
		expect(merged.find((t) => t.id === 'c')?.text).toBe('New remote todo');
	});

	it('propagates tombstones when an item is deleted more recently', () => {
		const local: Todo[] = [
			{
				id: 'x',
				text: 'Deleted item',
				completed: false,
				createdAt: '2026-01-01T09:00:00.000Z',
				updatedAt: '2026-01-01T12:00:00.000Z',
				deletedAt: '2026-01-01T12:00:00.000Z'
			}
		];
		const remote: Todo[] = [
			{
				id: 'x',
				text: 'Deleted item',
				completed: false,
				createdAt: '2026-01-01T09:00:00.000Z',
				updatedAt: '2026-01-01T10:00:00.000Z'
			}
		];

		const merged = mergeRecords(local, remote);
		expect(merged[0].deletedAt).toBe('2026-01-01T12:00:00.000Z');
	});

	it('normalizes legacy v1 snapshots combining old notes and pages', () => {
		const normalized = normalizeSnapshot({
			version: 1,
			savedAt: '2026-01-01T10:00:00.000Z',
			todos: [{ id: 1, text: 'Old todo', completed: false, createdAt: '2026-01-01T09:00:00.000Z' }],
			notes: [{ id: 42, content: '# Legacy Note\nHello', createdAt: '2026-01-01T09:00:00.000Z' }],
			pages: [
				{
					id: 'p1',
					title: 'Old Page',
					parentId: null,
					blocks: [{ id: 'b1', type: 'paragraph', content: 'Body' }],
					createdAt: '2026-01-01T09:00:00.000Z',
					updatedAt: '2026-01-01T09:30:00.000Z'
				}
			]
		});

		expect(normalized).not.toBeNull();
		expect(normalized?.version).toBe(2);
		expect(normalized?.todos).toHaveLength(1);
		expect(normalized?.notes).toHaveLength(2);
		expect(normalized?.notes.some((n) => n.id === 'legacy-note-42')).toBe(true);
		expect(normalized?.notes.some((n) => n.id === 'p1')).toBe(true);
	});

	it('prunes expired tombstones and detects equal snapshots regardless of order', () => {
		const now = Date.parse('2026-03-01T00:00:00.000Z');
		const kept = pruneTombstones(
			[
				{ id: 'old', deletedAt: '2026-01-01T00:00:00.000Z' },
				{ id: 'recent', deletedAt: '2026-02-25T00:00:00.000Z' },
				{ id: 'active' }
			],
			now
		);
		expect(kept.map((i) => i.id)).toEqual(['recent', 'active']);

		const t1: Todo = {
			id: '1',
			text: 'A',
			completed: false,
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z'
		};
		const t2: Todo = { ...t1, id: '2', text: 'B' };
		expect(snapshotsEqual({ todos: [t1, t2], notes: [] }, { todos: [t2, t1], notes: [] })).toBe(
			true
		);
	});
});
