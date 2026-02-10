export type TaskType = 'Change Request' | 'Issue';

export type ColumnId = 'todo' | 'inprogress' | 'retest' | 'feedback' | 'done';

export interface Task {
	id: number;
	description: string;
	type: TaskType;
	feedback: string;
	section: string;
	createdAt: string;
	updatedAt: string;
	locked?: boolean;
	images?: string[];
}

export interface Column {
	id: ColumnId;
	title: string;
	items: Task[];
}

export interface BoardData {
	passwordHash: string;
	version: string;
	columns: Column[];
	disableAddTask: boolean;
}

export interface ModalData {
	description: string;
	type: TaskType;
	feedback: string;
	section: string;
	images: string[];
}

export interface Toast {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
}
