import { Router } from 'express';
import { taskHandler } from '../handlers/task.handler';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  getTasksSchema,
  getTaskByIdSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
} from '../utils/schemas';

const router = Router();

// Apply authentication globally to all tasks routes
router.use(authenticate);

router.get('/', validate(getTasksSchema), taskHandler.getTasks);
router.get('/:id', validate(getTaskByIdSchema), taskHandler.getTaskById);

// Creators & Modifiers: Admin and Manager
router.post(
  '/',
  authorize(['admin', 'manager']),
  validate(createTaskSchema),
  taskHandler.createTask
);

router.patch(
  '/:id',
  authorize(['admin', 'manager']),
  validate(updateTaskSchema),
  taskHandler.updateTask
);

router.delete(
  '/:id',
  authorize(['admin', 'manager']),
  validate(deleteTaskSchema),
  taskHandler.deleteTask
);

// Status updates: Admin, Manager, Member
router.patch(
  '/:id/status',
  authorize(['admin', 'manager', 'member']),
  validate(updateTaskStatusSchema),
  taskHandler.updateTaskStatus
);

export default router;
