import WebSocket from 'ws';
import { Task } from './task';
import { TaskStatus } from '@/core/types';

export class TaskEngine {
  private tasks: Map<string, Task> = new Map();
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
    this.executeTask(task);
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  subscribeToTask(taskId: string, ws: WebSocket): void {
    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, new Set());
    }
    this.subscriptions.get(taskId)!.add(ws);
  }

  private async executeTask(task: Task): Promise<void> {
    try {
      for (const step of task.steps) {
        await step();
        this.updateTaskProgress(task);
      }
      task.status = TaskStatus.Completed;
    } catch (error) {
      task.status = TaskStatus.Failed;
      task.error = error instanceof Error ? error.message : 'Unknown error';
    }
    this.updateTaskProgress(task);
  }

  private updateTaskProgress(task: Task): void {
    const subscribers = this.subscriptions.get(task.id);
    if (subscribers) {
      const update = JSON.stringify({
        taskId: task.id,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error
      });
      subscribers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(update);
        }
      });
    }
  }
}

const taskEngine = new TaskEngine();
export default taskEngine;