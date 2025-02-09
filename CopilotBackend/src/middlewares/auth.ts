import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        activationCode: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}; 