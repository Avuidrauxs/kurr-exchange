import { TaskDetails, TaskStatus } from "../../types";

export abstract class Task {
  id: string;
  status: TaskStatus = TaskStatus.Pending;
  progress: number = 0;
  result: TaskDetails = {};
  error?: string;
  abstract steps: (() => Promise<void>)[];

  constructor(id: string) {
    this.id = id;
  }
}