import express from 'express';
import SimulateExchangeController from './controller';
import taskEngine from '@/core/infrastructure/task-engine/taskEngine';

export function createSimulateExchangeRouter(): express.Router {
  const simulateExchangeController = new SimulateExchangeController(taskEngine);
  const router = express.Router();

  router.post('/simulate-exchange', simulateExchangeController.simulateExchange);
  router.get('/simulate-exchange/:id', simulateExchangeController.getTaskStatus);
  router.get('/simulate-exchange', simulateExchangeController.getAllTasks);

  return router;
}
