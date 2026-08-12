import { Router } from 'express';
import { auditLogHandler } from '../handlers/auditLog.handler';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { getAuditLogsSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', validate(getAuditLogsSchema), auditLogHandler.getAuditLogs);

export default router;
