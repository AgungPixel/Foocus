export interface Note {
	id: number;
	content: string;
	createdAt: string;
}

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	createdAt: string;
}

export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'bullet' | 'todo';

export interface Block {
	id: string;
	type: BlockType;
	content: string;
	checked?: boolean;
}

export interface Page {
	id: string;
	title: string;
	parentId: string | null;
	blocks: Block[];
	createdAt: string;
	updatedAt: string;
}
