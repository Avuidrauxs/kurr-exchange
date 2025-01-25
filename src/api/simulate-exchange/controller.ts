import { NextFunction, Request, Response } from 'express';
import { TaskEngine } from '../../core/infrastructure/task-engine/taskEngine';
import { SimulateExchangeTaskService } from './task-service';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from '../../core/types';
import { config } from '../../core/config';
import RedisClient from '../../core/lib/redis/RedisClient';

class SimulateExchangeController {
    private readonly taskEngine: TaskEngine;
    private redisClient = RedisClient.getInstance();

    constructor(taskEngine: TaskEngine) {
        if (!taskEngine) {
            throw new Error('TaskEngine is required');
        }
        this.taskEngine = taskEngine;
    }

    // POST /simulate-exchange
    async simulateExchange(req: Request, res: Response, next: NextFunction) {
        try {
            const { baseCurrency, targetCurrency, amount } = req.body as unknown as {
                baseCurrency: string;
                targetCurrency: string; 
                amount: number;
            };
        
            if (!baseCurrency || !targetCurrency || !amount) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            if (config.redis.enabled) {
                const cacheKey = `exchange:${baseCurrency}:${targetCurrency}:${amount}`;
                const cachedResult = await this.redisClient.get(cacheKey);
          
                if (cachedResult) {
                  const parsedResult = JSON.parse(cachedResult);
                  res.status(200).json({ ...parsedResult, cached: true });
                  return;
                }
            }

            const taskId = uuidv4();
            const task = new SimulateExchangeTaskService(taskId, baseCurrency, targetCurrency, amount);
            this.taskEngine.addTask(task);
        
            res.status(201).json({ taskId });
        } catch (error) {
            next(error);
        }
    }

    private formatTaskResponse(task: any) {
        const baseResponse = {
            status: task.status,
            progress: task.progress,
        };

        switch (task.status) {
            case TaskStatus.Completed:
                return { ...baseResponse, result: task.result };
            case TaskStatus.Failed:
                return { ...baseResponse, error: task.error };
            default:
                return baseResponse;
        }
    }

    // GET /simulate-exchange/:id
    async getTaskStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskId } = req.params;
        const task = this.taskEngine.getTask(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.status === 'completed' && config.redis.enabled) {
            const cacheKey = `exchange:${task.payload.baseCurrency}:${task.payload.targetCurrency}:${task.payload.amount}`;
            await this.redisClient.set(cacheKey, JSON.stringify(task));
            }
            res.json(this.formatTaskResponse(task));
        } catch (error) {
            next(error);
        }
    }

    // GET /simulate-exchange
    async getAllTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const tasks = this.taskEngine.getAllTasks();
            const tasksOverview = tasks.map(task => this.formatTaskResponse(task));
            res.json(tasksOverview);
        } catch (error) {
            next(error);
        }
    }
}

export { SimulateExchangeController };