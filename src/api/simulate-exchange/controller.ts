import { NextFunction, Request, Response } from 'express';
import { TaskEngine } from '../../core/infrastructure/task-engine/taskEngine';
import { SimulateExchangeTaskService } from './task-service';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from '../../core/types';

class SimulateExchangeController {
    private readonly taskEngine: TaskEngine;

    constructor(taskEngine: TaskEngine) {
        if (!taskEngine) {
            throw new Error('TaskEngine is required');
        }
        this.taskEngine = taskEngine;
    }

    // POST /simulate-exchange
    async simulateExchange(req: Request, res: Response) {
        const { baseCurrency, targetCurrency, amount } = req.body as unknown as {
            baseCurrency: string;
            targetCurrency: string; 
            amount: number;
        };
    
        if (!baseCurrency || !targetCurrency || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const taskId = uuidv4();
        const task = new SimulateExchangeTaskService(taskId, baseCurrency, targetCurrency, amount);
        this.taskEngine.addTask(task);
    
        res.status(201).json({ taskId });
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
    async getTaskStatus(req: Request, res: Response) {
        const { taskId } = req.params;
        const task = this.taskEngine.getTask(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(this.formatTaskResponse(task));
    }

    // GET /simulate-exchange
    async getAllTasks(req: Request, res: Response) {
        const tasks = this.taskEngine.getAllTasks();
        const tasksOverview = tasks.map(task => this.formatTaskResponse(task));
        res.json(tasksOverview);
    }
}

export { SimulateExchangeController };