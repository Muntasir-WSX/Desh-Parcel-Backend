import { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PROTECTED_ADMIN_EMAIL } from '../config/admin';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | { id: string; email: string; role: string };
}

const auth = (...requiredRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'You are not authorized! Token missing.',
          errors: [{ path: '', message: 'Token missing or invalid format' }],
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'You are not authorized! Token missing.',
          errors: [{ path: '', message: 'Token missing or invalid format' }],
        });
        return;
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables!');
      }

     
      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (!decoded.id) {
        res.status(401).json({
          success: false,
          message: 'Invalid token payload.',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: String(decoded.id) },
        include: { riderProfile: true },
      });

      if (
        !user ||
        user.isBanned ||
        (user.role === 'ADMIN' && user.email.toLowerCase() !== PROTECTED_ADMIN_EMAIL)
      ) {
        res.status(401).json({
          success: false,
          message: 'Your account is not allowed to access this resource.',
        });
        return;
      }

      if (user.role === 'RIDER' && !user.riderProfile?.isApproved) {
        res.status(403).json({
          success: false,
          message: 'Your rider account is waiting for admin approval.',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: 'Forbidden! You do not have permission to access this resource.',
          errors: [{ path: '', message: 'Unauthorized role access' }],
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
        errors: [{ path: '', message: error.message }],
      });
    }
  };
};

export default auth;