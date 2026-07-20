const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
      }
    });

    io.on('connection', (socket) => {
      console.log('[SOCKET] Client connected:', socket.id);

      // Join a room based on vendorId
      socket.on('join_vendor_room', (vendorId) => {
        if (vendorId) {
          socket.join(`vendor_${vendorId}`);
          console.log(`[SOCKET] Socket ${socket.id} joined room vendor_${vendorId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('[SOCKET] Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      console.error('Socket.io not initialized!');
      return null;
    }
    return io;
  }
};
