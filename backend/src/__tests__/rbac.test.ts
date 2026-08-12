import request from 'supertest';
import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { errorHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Create a mock app to isolate testing middlewares
const app = express();
app.use(express.json());

// Set mock env vars
env.JWT_ACCESS_SECRET = 'test_access_secret';

// Test endpoint with authentication + authorize (admin, manager)
const dummySchema = z.object({
  body: z.object({
    content: z.string(),
  }).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

app.post(
  '/test-route',
  authenticate,
  authorize(['admin', 'manager']),
  validate(dummySchema),
  (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Access granted' });
  }
);

// Fallback error handler
app.use(errorHandler);

describe('RBAC & Auth Middleware Integration Tests', () => {
  const generateToken = (role: 'admin' | 'manager' | 'member', id = '654321098765432109876543') => {
    return jwt.sign(
      { id, email: `${role}@example.com`, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
  };

  it('should deny access if authorization header is missing', async () => {
    const res = await request(app)
      .post('/test-route')
      .send({ content: 'hello' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access token is missing');
  });

  it('should deny access if token is invalid', async () => {
    const res = await request(app)
      .post('/test-route')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ content: 'hello' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid access token');
  });

  it('should deny access for insufficient roles (e.g. member)', async () => {
    const token = generateToken('member');
    const res = await request(app)
      .post('/test-route')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('should allow access for manager', async () => {
    const token = generateToken('manager');
    const res = await request(app)
      .post('/test-route')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Access granted');
  });

  it('should allow access for admin', async () => {
    const token = generateToken('admin');
    const res = await request(app)
      .post('/test-route')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 Bad Request on validation failure', async () => {
    const token = generateToken('admin');
    const res = await request(app)
      .post('/test-route')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 123 }); // content is a number, schema expects string

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation Error');
  });
});
