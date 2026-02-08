import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class CryptoUtil {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}
