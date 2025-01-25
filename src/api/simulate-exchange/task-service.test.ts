import { SimulateExchangeTaskService } from './task-service';
import { TaskStatus } from '../../core/types';
import { TaskEngine } from '../../core/infrastructure/task-engine/taskEngine';

describe('SimulateExchangeTaskService', () => {
  let service: SimulateExchangeTaskService;
  let taskEngine: TaskEngine;

  beforeEach(() => {
    service = new SimulateExchangeTaskService('test-id', 'USD', 'EUR', 100);
    taskEngine = new TaskEngine();
  });

  it('should initialize with correct properties', () => {
    expect(service.id).toBe('test-id');
    expect(service.status).toBe(TaskStatus.Pending);
    expect(service.progress).toBe(0);
    expect(service.result).toEqual({});
  });

  it('should successfully complete all steps', async () => {
    taskEngine.addTask(service);
    
    expect(service.status).toBe(TaskStatus.Completed);
    expect(service.progress).toBe(1);
    expect(service.result.conversionRate).toBeDefined();
    expect(service.result.exchangeAmount).toBeDefined();
    expect(typeof service.result.conversionRate).toBe('number');
    expect(typeof service.result.exchangeAmount).toBe('number');
  }, 30000); // Increased timeout due to simulation delays

  it('should fail with invalid base currency', async () => {
    const invalidService = new SimulateExchangeTaskService('test-id', 'XXX', 'EUR', 100);
    
    taskEngine.addTask(invalidService);
    expect(invalidService.status).toBe(TaskStatus.Failed);
  });

  it('should fail with invalid target currency', async () => {
    const invalidService = new SimulateExchangeTaskService('test-id', 'USD', 'XXX', 100);
    
    taskEngine.addTask(invalidService);
    expect(invalidService.status).toBe(TaskStatus.Failed);
  });

  it('should fail with invalid amount', async () => {
    const invalidService = new SimulateExchangeTaskService('test-id', 'USD', 'EUR', -100);
    
    taskEngine.addTask(invalidService);
    expect(invalidService.status).toBe(TaskStatus.Failed);
  });

  it('should update progress during simulation', async () => {
    const progressSnapshots: number[] = [];
    
    // Start execution
    const executePromise = taskEngine.addTask(service);
    
    // Monitor progress
    const progressInterval = setInterval(() => {
      progressSnapshots.push(service.progress);
    }, 1000);

    await executePromise;
    clearInterval(progressInterval);

    expect(progressSnapshots.length).toBeGreaterThan(0);
    expect(Math.max(...progressSnapshots)).toBeLessThanOrEqual(1);
    expect(Math.min(...progressSnapshots)).toBeGreaterThanOrEqual(0);
    
    // Verify progress increases
    for (let i = 1; i < progressSnapshots.length; i++) {
      expect(progressSnapshots[i]).toBeGreaterThanOrEqual(progressSnapshots[i - 1]);
    }
  }, 30000);

  it('should reset service state correctly', async () => {
    // First run
    taskEngine.addTask(service);
    expect(service.status).toBe(TaskStatus.Completed);
    expect(service.progress).toBe(1);
    expect(service.result).toBeDefined();

    // Reset
    service.reset();
    expect(service.status).toBe(TaskStatus.Pending);
    expect(service.progress).toBe(0);
    expect(service.result).toEqual({});
  }, 30000);

  it('should handle multiple currency pairs', async () => {
    const currencyPairs = [
      { base: 'USD', target: 'EUR' },
      { base: 'EUR', target: 'GBP' },
      { base: 'GBP', target: 'JPY' },
      { base: 'JPY', target: 'USD' }
    ];

    for (const pair of currencyPairs) {
      const pairService = new SimulateExchangeTaskService('test-id', pair.base, pair.target, 100);
      taskEngine.addTask(pairService);
      
      expect(pairService.status).toBe(TaskStatus.Completed);
      expect(pairService.result.conversionRate).toBeGreaterThanOrEqual(0.5);
      expect(pairService.result.conversionRate).toBeLessThanOrEqual(1.5);
    }
  }, 30000);
});
