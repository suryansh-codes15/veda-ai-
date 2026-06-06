import { io, Socket } from 'socket.io-client';
import type { JobProgressEvent, JobCompleteEvent, JobFailedEvent } from '../../shared/types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('🔌 WebSocket connected:', socket?.id));
    socket.on('disconnect', () => console.log('🔌 WebSocket disconnected'));
    socket.on('connect_error', (err) => console.error('WebSocket error:', err.message));
  }

  return socket;
}

export function subscribeToAssignment(
  assignmentId: string,
  onProgress: (e: JobProgressEvent) => void,
  onComplete: (e: JobCompleteEvent) => void,
  onFailed: (e: JobFailedEvent) => void
): () => void {
  const sock = getSocket();

  sock.emit('subscribe:assignment', assignmentId);

  const handleProgress = (data: JobProgressEvent) => {
    if (data.assignmentId === assignmentId) onProgress(data);
  };
  const handleComplete = (data: JobCompleteEvent) => {
    if (data.assignmentId === assignmentId) onComplete(data);
  };
  const handleFailed = (data: JobFailedEvent) => {
    if (data.assignmentId === assignmentId) onFailed(data);
  };

  sock.on('job:progress', handleProgress);
  sock.on('job:complete', handleComplete);
  sock.on('job:failed', handleFailed);

  // Return unsubscribe function
  return () => {
    sock.emit('unsubscribe:assignment', assignmentId);
    sock.off('job:progress', handleProgress);
    sock.off('job:complete', handleComplete);
    sock.off('job:failed', handleFailed);
  };
}
