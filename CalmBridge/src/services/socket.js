import { io } from 'socket.io-client';

const socket = io('https://baack-1.onrender.com/', {
  transports: ['websocket'],
});

export { socket };