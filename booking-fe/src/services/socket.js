import { io } from 'socket.io-client';

let socket = null;
const listeners = new Map();

const getBackendUrl = () => {
    return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
};

export const connectSocket = () => {
    if (socket && socket.connected) return socket;
    socket = io(getBackendUrl(), {
        transports: ['websocket', 'polling'],
        autoConnect: true
    });
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        listeners.clear();
    }
};

export const joinRooms = (payload) => {
    const s = connectSocket();
    const emit = () => s.emit('join', payload);
    if (s.connected) emit();
    else s.once('connect', emit);
};

export const leaveRooms = (payload) => {
    if (socket && socket.connected) socket.emit('leave', payload);
};

export const onSocket = (event, handler) => {
    const s = connectSocket();
    s.on(event, handler);
    const key = `${event}::${handler.name || Math.random()}`;
    listeners.set(key, { event, handler });
    return () => {
        s.off(event, handler);
        listeners.delete(key);
    };
};

export const offSocket = (event, handler) => {
    if (socket) socket.off(event, handler);
};

export const getSocket = () => socket;

export default {
    connectSocket,
    disconnectSocket,
    joinRooms,
    leaveRooms,
    onSocket,
    offSocket,
    getSocket
};
