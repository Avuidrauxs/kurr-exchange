export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed'
}

export type TaskDetails = {
  conversionRate?: number;
  exchangeAmount?: number;
  retrieveAmount?: number;
  simulationReport?: string;
}