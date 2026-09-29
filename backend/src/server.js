const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'neochat-secret-key';

// Database connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neochat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Models
const { User, Message } = require('./models');

// Import routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Authentication
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        socket.userId = user._id;
        socket.username = user.username;
        socket.user = user;
        
        // Update user status
        await User.findByIdAndUpdate(user._id, { status: 'online', lastSeen: new Date() });
        
        // Join default room
        socket.join('general');
        
        // Emit successful authentication
        socket.emit('authenticated', {
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          status: user.status
        });
        
        // Notify others about new user
        socket.to('general').emit('user-connected', {
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          status: user.status
        });
        
        // Send history
        const messages = await Message.find({ room: 'general' }).populate('sender', 'username avatar').limit(50);
        socket.emit('message-history', messages);
      } else {
        socket.emit('auth-error', 'Usuário não encontrado');
      }
    } catch (error) {
      socket.emit('auth-error', 'Token inválido');
    }
  });

  // Join room
  socket.on('join-room', (room) => {
    socket.join(room);
    socket.emit('joined-room', room);
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    if (!socket.userId) {
      socket.emit('error', 'Autenticação necessária');
      return;
    }
    
    try {
      const message = new Message({
        sender: socket.userId,
        content: data.content,
        room: data.room || 'general',
        readBy: [socket.userId]
      });
      
      const savedMessage = await message.populate('sender', 'username avatar');
      await savedMessage.save();
      
      // Emit to room
      io.to(data.room || 'general').emit('new-message', savedMessage);
    } catch (error) {
      socket.emit('error', 'Erro ao enviar mensagem');
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.room || 'general').emit('user-typing', {
      userId: socket.userId,
      username: socket.username,
      room: data.room
    });
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    socket.to(data.room || 'general').emit('user-stop-typing', {
      userId: socket.userId,
      room: data.room
    });
  });

  // User status update
  socket.on('update-status', async (status) => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { status, lastSeen: new Date() });
      io.emit('user-status-update', {
        userId: socket.userId,
        username: socket.username,
        status: status
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Cliente desconectado:', socket.id);
    
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { 
        status: 'offline', 
        lastSeen: new Date() 
      });
      
      io.emit('user-disconnected', {
        userId: socket.userId,
        username: socket.username
      });
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor NEOCHAT rodando na porta ${PORT}`);
});
