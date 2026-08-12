import { Router } from 'express';
import { authHandler } from '../handlers/auth.handler';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { registerSchema, loginSchema, emptySchema } from '../utils/schemas';

const router = Router();

router.post('/register', validate(registerSchema), authHandler.register);
router.post('/login', validate(loginSchema), authHandler.login);
router.post('/refresh', authHandler.refresh); // reads refresh token from cookie, handled in handler
router.post('/logout', authenticate, authHandler.logout);
router.get('/me', authenticate, validate(emptySchema), authHandler.me);

export default router;
