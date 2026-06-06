import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

export function setupSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Client can subscribe to a specific assignment's events
    socket.on('subscribe:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`📡 Socket ${socket.id} subscribed to assignment:${assignmentId}`);
    });

    socket.on('unsubscribe:assignment', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
