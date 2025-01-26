import WebSocket from 'ws';
import { Task } from '../../interfaces/task';
import { TaskStatus } from '../../types';
import { config } from '../../config';
import logger from '../../lib/logger';

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
    logger.info(`Subscribing to task ${taskId}`);
    if (!this.subscriptions.has(taskId)) {
      this.subscriptions.set(taskId, new Set());
    }
    const subscribers = this.subscriptions.get(taskId)!;
    subscribers.add(ws);
    logger.info(`Current subscribers for task ${taskId}: ${subscribers.size}`);
  }

  // Retry strategy
  private async retryOperation<T>(
    operation: () => Promise<T>,
    taskId: string,
    maxRetries: number = config.maxRetries,
    delay: number = config.retryDelay
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) break;
        
        const task = this.tasks.get(taskId);
        if (task) {
          task.status = TaskStatus.Retrying;
          task.error = `Retry attempt ${attempt + 1} of ${maxRetries}`;
          this.updateTaskProgress(task);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  private async executeTask(task: Task): Promise<void> {
    try {
      await this.retryOperation(async () => {
        if (task.parallel) {
          await Promise.all(task.steps.map(async (step) => {
            await step();
            this.updateTaskProgress(task);
          }));
        } else {
          for (const step of task.steps) {
            await step();
            this.updateTaskProgress(task);
          }
        }
        task.status = TaskStatus.Completed;
      }, task.id);
    } catch (error) {
      task.status = TaskStatus.Failed;
      task.error = error instanceof Error ? error.message : 'Unknown error';
      this.updateTaskProgress(task);
    }
  }

  private updateTaskProgress(task: Task): void {
    const subscribers = this.subscriptions.get(task.id);
    logger.info(`Updating task ${task.id}, subscribers: ${subscribers?.size || 0}`);
    if (subscribers) {
      const update = JSON.stringify({
        taskId: task.id,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error
      });
      logger.info(`Sending update: ${update}`);
      subscribers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(update);
        } else {
          logger.info(`WebSocket not open, state: ${ws.readyState}`);
        }
      });
    }
  }
}

const taskEngine = new TaskEngine();
export default taskEngine;