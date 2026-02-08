import { Request, Response, NextFunction } from 'express';
import { CryptoUtil } from '../utils/crypto';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token không được cung cấp' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = CryptoUtil.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
};
