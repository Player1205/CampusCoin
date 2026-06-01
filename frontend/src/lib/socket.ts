import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create the Socket.io connection.
 * The token is extracted from cookies automatically by the server,
 * but we also pass it via auth for environments where cookies aren't sent.
 */
export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const baseUrl = import.meta.env.VITE_API_URL || '';

  socket = io(baseUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Call this on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
