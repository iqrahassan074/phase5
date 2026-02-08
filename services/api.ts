
import { Task, Priority, RecurrenceRule } from '../types';

/**
 * Backend interactions go through Dapr Service Invocation.
 * In a real production environment, BASE_URL would be your Dapr sidecar endpoint.
 */
const BASE_URL = '/api/tasks'; // Relative to frontend proxy

// Simulating local storage persistence for hackathon prototype
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design TaskFlow AI components',
    description: 'Create high-fidelity UI for dashboard and chat input',
    dueDate: new Date().toISOString(),
    priority: Priority.HIGH,
    tags: ['design', 'frontend'],
    isCompleted: false,
    recurrence: RecurrenceRule.NONE,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Sync with backend developers',
    description: 'Ensure Dapr sidecar and Kafka pub/sub are ready',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: Priority.MEDIUM,
    tags: ['devops', 'backend'],
    isCompleted: false,
    recurrence: RecurrenceRule.DAILY,
    createdAt: new Date().toISOString()
  }
];

export const taskService = {
  async getTasks(): Promise<Task[]> {
    // REAL: fetch(BASE_URL)
    const stored = localStorage.getItem('taskflow_tasks');
    return stored ? JSON.parse(stored) : MOCK_TASKS;
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>): Promise<Task> {
    // REAL: fetch(BASE_URL, { method: 'POST', body: JSON.stringify(task) })
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(7),
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    const current = await this.getTasks();
    const updated = [newTask, ...current];
    localStorage.setItem('taskflow_tasks', JSON.stringify(updated));
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // REAL: fetch(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    const current = await this.getTasks();
    const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
    localStorage.setItem('taskflow_tasks', JSON.stringify(updated));
    return updated.find(t => t.id === id)!;
  },

  async deleteTask(id: string): Promise<void> {
    // REAL: fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
    const current = await this.getTasks();
    const updated = current.filter(t => t.id !== id);
    localStorage.setItem('taskflow_tasks', JSON.stringify(updated));
  },

  async duplicateTask(id: string): Promise<Task> {
    const current = await this.getTasks();
    const task = current.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    
    const { id: _, createdAt: __, ...rest } = task;
    return this.createTask({
      ...rest,
      title: `${rest.title} (Copy)`
    });
  }
};
