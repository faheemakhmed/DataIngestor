import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/lib/config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, config.jwtSecret, { expiresIn: '24h' });
}