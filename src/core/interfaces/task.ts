import { TaskDetails, TaskPayload, TaskStatus } from "../types";


export abstract class Task {
  id: string;
  status: TaskStatus = TaskStatus.Pending;
  progress?: number = 0;
  parallel?: boolean = false;
  result?: any = {};
  payload: TaskPayload = {};
  error?: string;
  abstract steps: (() => Promise<void>)[];

  constructor(id: string) {
    this.id = id;
  }

  reset(): void {
    this.status = TaskStatus.Pending;
    this.progress = 0;
    this.result = {};
    this.error = undefined;
  }
}