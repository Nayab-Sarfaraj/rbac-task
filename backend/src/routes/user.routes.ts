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

// Apply authentication and Admin role checks globally on this router
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', validate(getUsersSchema), userHandler.getUsers);
router.get('/:id', validate(getUserByIdSchema), userHandler.getUserById);
router.patch('/:id/role', validate(updateUserRoleSchema), userHandler.updateUserRole);
router.patch('/:id/deactivate', validate(deactivateUserSchema), userHandler.deactivateUser);

export default router;
