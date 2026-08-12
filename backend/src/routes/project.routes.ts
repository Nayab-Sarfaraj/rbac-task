import { Router } from 'express';
import { projectHandler } from '../handlers/project.handler';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  getProjectsSchema,
  getProjectByIdSchema,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
} from '../utils/schemas';

const router = Router();

// Apply authentication globally to all projects routes
router.use(authenticate);

router.get('/', validate(getProjectsSchema), projectHandler.getProjects);
router.get('/:id', validate(getProjectByIdSchema), projectHandler.getProjectById);

// Creation, update, delete, member management: Admin and Manager only
router.post(
  '/',
  authorize(['admin', 'manager']),
  validate(createProjectSchema),
  projectHandler.createProject
);

router.patch(
  '/:id',
  authorize(['admin', 'manager']),
  validate(updateProjectSchema),
  projectHandler.updateProject
);

router.delete(
  '/:id',
  authorize(['admin', 'manager']),
  validate(deleteProjectSchema),
  projectHandler.deleteProject
);

router.post(
  '/:id/members',
  authorize(['admin', 'manager']),
  validate(addProjectMemberSchema),
  projectHandler.addMember
);

router.delete(
  '/:id/members/:userId',
  authorize(['admin', 'manager']),
  validate(removeProjectMemberSchema),
  projectHandler.removeMember
);

export default router;
