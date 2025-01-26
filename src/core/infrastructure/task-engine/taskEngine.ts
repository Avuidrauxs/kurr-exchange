import WebSocket from 'ws';
import { Task } from '../../interfaces/task';
import { TaskStatus } from '../../types';
import { config } from '../../config';

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
    console.log(`Subscribing to task ${taskId}`);
    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, new Set());
    }
    const subscribers = this.subscriptions.get(taskId)!;
    subscribers.add(ws);
    console.log(`Current subscribers for task ${taskId}: ${subscribers.size}`);
  }

  private async executeTask(task: Task, retryCount: number = 0): Promise<void> {
    try {
      if (task.parallel) {
        // Execute steps in parallel
        await Promise.all(task.steps.map(async (step) => {
          await step();
          this.updateTaskProgress(task);
        }));
      } else {
        // Execute steps sequentially
        for (const step of task.steps) {
          await step();
          this.updateTaskProgress(task);
        }
      }
      task.status = TaskStatus.Completed;
    } catch (error) {
      if (retryCount < config.maxRetries) {
        task.status = TaskStatus.Retrying;
        task.error = `Retry attempt ${retryCount + 1} of ${config.maxRetries}`;
        this.updateTaskProgress(task);

        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        await this.executeTask(task, retryCount + 1);
      } else {
        task.status = TaskStatus.Failed;
        task.error = error instanceof Error ? error.message : 'Unknown error';
        this.updateTaskProgress(task);
      }
    }
  }

  private updateTaskProgress(task: Task): void {
    const subscribers = this.subscriptions.get(task.id);
    console.log(`Updating task ${task.id}, subscribers: ${subscribers?.size || 0}`);
    if (subscribers) {
      const update = JSON.stringify({
        taskId: task.id,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error
      });
      console.log(`Sending update: ${update}`);
      subscribers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(update);
        } else {
          console.log(`WebSocket not open, state: ${ws.readyState}`);
        }
      });
    }
  }
}

const taskEngine = new TaskEngine();
export default taskEngine;