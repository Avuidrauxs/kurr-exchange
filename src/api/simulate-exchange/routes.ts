import { Router } from 'express';
import { SimulateExchangeController } from './controller';
import { TaskEngine } from '../../core/infrastructure/task-engine/taskEngine';

const router = Router();
const taskEngine = new TaskEngine();
const controller = new SimulateExchangeController(taskEngine);

router.post('/simulate-exchange', controller.simulateExchange.bind(controller));
router.get('/simulate-exchange/:taskId', controller.getTaskStatus.bind(controller));
router.get('/simulate-exchange', controller.getAllTasks.bind(controller));

export default router;
