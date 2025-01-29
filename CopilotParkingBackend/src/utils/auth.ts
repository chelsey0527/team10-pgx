import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

export const generateToken = (userId: string, activationCode: string): string => {
  return jwt.sign(
    { 
      userId,
      activationCode 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      activationCode: string;
    };
  } catch (error) {
    return null;
  }
}; 