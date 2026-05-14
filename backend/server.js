require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*" } 
});

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/driver', require('./routes/driverRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRide', (rideId) => {
    socket.join(rideId);
    console.log(`User joined ride room: ${rideId}`);
  });

  socket.on('joinCompany', (company) => {
    socket.join(`company_${company}`);
    console.log(`User joined company room: company_${company}`);
  });

  socket.on('locationUpdate', (data) => {
    io.to(data.rideId).emit('driverLocation', data);
  });

  socket.on('triggerSOS', (data) => {
    console.log('SOS TRIGGERED:', data);
    const { company, name, emergencyContact, rideId } = data;
    
    // Broadcast ONLY to the company room (Admins of that company)
    io.to(`company_${company}`).emit('emergencyAlert', data);
    
    // Simulate sending alert to emergency contact
    console.log(`EMERGENCY NOTIFICATION sent to ${emergencyContact} for employee ${name}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});