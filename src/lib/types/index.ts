export interface Todo {
	id: number | string;
	text: string;
	completed: boolean;
	createdAt: string;
	updatedAt: string;
	expiresAt?: number;
	deletedAt?: string;
}

export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'bullet' | 'todo';

export interface Block {
	id: string;
	type: BlockType;
	content: string;
	checked?: boolean;
}

export interface NotePage {
	id: string;
	title: string;
	parentId: string | null;
	blocks: Block[];
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

/** Format catatan lama sebelum penggabungan My Notes & Pages. */
export interface LegacyNote {
	id: number;
	content: string;
	createdAt: string;
}

/** Alias agar kompatibel dengan penamaan Page. */
export type Page = NotePage;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
