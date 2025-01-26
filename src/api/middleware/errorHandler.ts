import { Request, Response, NextFunction } from 'express';
import logger from '../../core/lib/logger';
import {
  SimulationError,
  TaskServiceError,
  ValidationError,
} from '../../core/errors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack);
  if (err instanceof ValidationError || err instanceof SimulationError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof TaskServiceError) {
    return res.status(422).json({ message: err.message });
  }
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message,
  });
};

export default errorHandler;
