import { Router } from 'express';
import { userHandler } from '../handlers/user.handler';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  getUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  deactivateUserSchema,
} from '../utils/schemas';

const router = Router();

// Apply authentication globally on this router
router.use(authenticate);

router.get('/', authorize(['admin', 'manager']), validate(getUsersSchema), userHandler.getUsers);
router.get('/:id', authorize(['admin', 'manager']), validate(getUserByIdSchema), userHandler.getUserById);
router.patch('/:id/role', authorize(['admin']), validate(updateUserRoleSchema), userHandler.updateUserRole);
router.patch('/:id/deactivate', authorize(['admin']), validate(deactivateUserSchema), userHandler.deactivateUser);

export default router;
