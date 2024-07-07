const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Object to store the locations of connected users
const userLocations = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Send the current locations of all connected users to the new user
  socket.emit('initLocations', userLocations);

  // Listen for location updates from clients
  socket.on('location', (location) => {
    console.log('location received:', location);

    // Update the user's location
    userLocations[socket.id] = location;

    // Broadcast the updated location to all clients except the sender
    socket.broadcast.emit('location', { id: socket.id, location });
  });

  // Handle client disconnections
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    
    // Remove the user's location
    delete userLocations[socket.id];

    // Notify all clients about the disconnection
    io.emit('userDisconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
