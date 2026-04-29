import { Server } from 'socket.io';

let io = null;

const ROOM = {
    ADMIN: 'admin',
    doctor: (id) => `doctor:${id}`,
    patient: (id) => `patient:${id}`,
    booking: (id) => `booking:${id}`,
    doctorQueue: (id) => `doctor-queue:${id}`
};

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.URL_REACT || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('join', (payload = {}) => {
            const { role, userId, bookingId, doctorId } = payload;
            if (role === 'R1') socket.join(ROOM.ADMIN);
            if (role === 'R2' && userId) {
                socket.join(ROOM.doctor(userId));
                socket.join(ROOM.doctorQueue(userId));
            }
            if (role === 'R3' && userId) socket.join(ROOM.patient(userId));
            if (bookingId) socket.join(ROOM.booking(bookingId));
            if (doctorId) socket.join(ROOM.doctorQueue(doctorId));
        });

        socket.on('leave', (payload = {}) => {
            const { bookingId, doctorId } = payload;
            if (bookingId) socket.leave(ROOM.booking(bookingId));
            if (doctorId) socket.leave(ROOM.doctorQueue(doctorId));
        });
    });

    console.log('[socket] initialized');
    return io;
};

const getIO = () => io;

const emitToAdmin = (event, data) => {
    if (!io) return;
    io.to(ROOM.ADMIN).emit(event, data);
};
const emitToDoctor = (doctorId, event, data) => {
    if (!io || !doctorId) return;
    io.to(ROOM.doctor(doctorId)).emit(event, data);
};
const emitToPatient = (patientId, event, data) => {
    if (!io || !patientId) return;
    io.to(ROOM.patient(patientId)).emit(event, data);
};
const emitToBooking = (bookingId, event, data) => {
    if (!io || !bookingId) return;
    io.to(ROOM.booking(bookingId)).emit(event, data);
};
const emitToDoctorQueue = (doctorId, event, data) => {
    if (!io || !doctorId) return;
    io.to(ROOM.doctorQueue(doctorId)).emit(event, data);
};

module.exports = {
    initSocket,
    getIO,
    emitToAdmin,
    emitToDoctor,
    emitToPatient,
    emitToBooking,
    emitToDoctorQueue,
    ROOM
};
