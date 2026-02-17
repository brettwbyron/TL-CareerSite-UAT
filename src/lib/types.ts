export const TASK_TYPES = ['Change Request', 'Issue', 'Feature'] as const;
export const DEVICE_TYPES = ['All', 'Desktop', 'Mobile'] as const;

export type DeviceType = typeof DEVICE_TYPES[number];
export type TaskType = typeof TASK_TYPES[number];

export type ColumnId = 'todo' | 'inprogress' | 'retest' | 'feedback' | 'done' | 'cancelled';

export interface Task {
	id: number;
	description: string;
	type?: TaskType;
	device: DeviceType;
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
	displayName?: string;
	uatEndDate?: string;
	devSiteUrl?: string;
	passwordHash: string;
	version: string;
	columns: Column[];
	disableAddTask: boolean;
}

export interface ModalData {
	description: string;
	type?: TaskType;
	device: DeviceType;
	feedback: string;
	section: string;
	images: string[];
}

export interface Toast {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
}
