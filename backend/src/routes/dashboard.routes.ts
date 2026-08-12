import { Router } from 'express';
import { dashboardHandler } from '../handlers/dashboard.handler';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardHandler.getStats);

export default router;
