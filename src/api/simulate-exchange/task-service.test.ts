import { SimulateExchangeTaskService } from './task-service';
import { TaskStatus } from '../../core/types';
import { TaskEngine } from '../../core/infrastructure/task-engine/taskEngine';

describe('SimulateExchangeTaskService', () => {
  let service: SimulateExchangeTaskService;
  let taskEngine: TaskEngine;
  taskEngine = new TaskEngine();

  beforeEach(() => {
    service = new SimulateExchangeTaskService('test-id', 'USD', 'EUR', 100);
  });

  it('should initialize with correct properties', () => {
    expect(service.id).toBe('test-id');
    expect(service.status).toBe(TaskStatus.Pending);
    expect(service.progress).toBe(0);
    expect(service.result).toEqual({});
  });

  it('should should in progress when task is running', async () => {
    const invalidService = new SimulateExchangeTaskService('test-id', 'USD', 'XXX', 100);
    
    taskEngine.addTask(invalidService);
    expect(invalidService.status).toBe(TaskStatus.InProgress);
  });
});
