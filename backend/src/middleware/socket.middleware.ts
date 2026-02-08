import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;

    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};
