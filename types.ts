
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RecurrenceRule {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum ViewType {
  TODAY = 'TODAY',
  UPCOMING = 'UPCOMING',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
  ALL = 'ALL'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  reminderTime?: string; // ISO string
  priority: Priority;
  tags: string[];
  isCompleted: boolean;
  recurrence: RecurrenceRule;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'COMPLETED' | 'SYNCED';
  taskTitle: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPending?: boolean;
}

export type SortField = 'dueDate' | 'priority' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
