const socketIo = require('socket.io');

const setupSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Track connected clients
    let connectedClients = 0;

    io.on('connection', (socket) => {
        connectedClients++;
        console.log(`✅ New client connected (ID: ${socket.id})`);
        console.log(`👥 Total connected clients: ${connectedClients}`);

        // Join specific rooms based on client type
        socket.on('join:room', (room) => {
            socket.join(room);
            console.log(`🚪 Client ${socket.id} joined room: ${room}`);
        });

        // Leave specific rooms
        socket.on('leave:room', (room) => {
            socket.leave(room);
            console.log(`🚪 Client ${socket.id} left room: ${room}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            connectedClients--;
            console.log(`❌ Client disconnected (ID: ${socket.id})`);
            console.log(`👥 Total connected clients: ${connectedClients}`);
        });

        // Ping-pong for connection health
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    // Make io accessible to controllers
    return io;
};

module.exports = setupSocket;