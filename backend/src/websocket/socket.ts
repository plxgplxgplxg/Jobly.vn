import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { authenticateSocket } from '../middleware/socket.middleware';
import MessageService from '../services/MessageService';

export function setupWebSocket(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authenticate socket connection
  io.use(authenticateSocket);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

    // Join user's room
    socket.join(`user:${userId}`);

    // Handle send message
    socket.on('send_message', async (data) => {
      try {
        const message = await MessageService.sendMessage(userId, data);

        // Emit to receiver
        io.to(`user:${data.receiverId}`).emit('new_message', message);

        // Emit back to sender
        socket.emit('message_sent', message);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle mark as read
    socket.on('mark_as_read', async (conversationId: string) => {
      try {
        await MessageService.markAsRead(conversationId, userId);
        socket.emit('marked_as_read', { conversationId });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
