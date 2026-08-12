export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
