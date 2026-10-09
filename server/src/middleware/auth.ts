import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'eduwatch-super-secure-jwt-secret-key-32chars';

export type UserRole = 'STUDENT' | 'SUBJECT_TEACHER' | 'CLASS_TEACHER' | 'TEACHER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  studentId?: string;
  teacherId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.eduwatch_token || req.cookies?.smartbro_token;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No session or token found.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!dbUser || !dbUser.isActive) {
      res.status(401).json({ success: false, message: 'Invalid session or account deactivated.' });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      fullName: dbUser.fullName,
      studentId: dbUser.studentProfile?.id,
      teacherId: dbUser.teacherProfile?.id,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    return;
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(', ')}], but current role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
}
