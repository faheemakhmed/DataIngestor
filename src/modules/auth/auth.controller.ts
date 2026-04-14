import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, validateUser } from './auth.service';
import { generateToken } from './auth.middleware';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const user = await createUser(data);
      const token = generateToken(user.id, user.email);
      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const user = await validateUser(data.email, data.password);
      
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const token = generateToken(user.id, user.email);
      res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();