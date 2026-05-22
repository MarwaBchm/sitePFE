import {io} from 'socket.io-client';

const socket = io('https://calmebridgeback.onrender.com/', {
  transports: ['websocket'],
});

export { socket };