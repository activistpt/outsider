const express = require('express');
const router = express.Router();

// Middleware for protecting routes
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neochat-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// User routes
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({}, 'username avatar status lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'username avatar status lastSeen');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

router.put('/users/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['online', 'offline', 'away'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, lastSeen: new Date() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Broadcast status change to all connected clients
    io.emit('user-status-update', {
      userId: user._id,
      username: user.username,
      status: user.status
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Message routes
router.get('/messages/:room', protect, async (req, res) => {
  try {
    const { room } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await Message.find({ room })
      .populate('sender', 'username avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

router.post('/messages', protect, async (req, res) => {
  try {
    const { content, room = 'general' } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Conteúdo da mensagem não pode estar vazio' });
    }
    
    const message = new Message({
      sender: req.user.userId,
      content: content.trim(),
      room,
      readBy: [req.user.userId]
    });
    
    const savedMessage = await message.populate('sender', 'username avatar');
    await savedMessage.save();
    
    // Emit to all clients in the room
    io.to(room).emit('new-message', savedMessage);
    
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

router.put('/messages/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const message = await Message.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar mensagem como lida' });
  }
});

// Admin routes
router.get('/admin/stats', protect, async (req, res) => {
  try {
    // Check if user is admin (you can add admin role to users)
    if (req.user.userId !== 'admin-id') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    
    const [totalUsers, totalMessages, activeUsers] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ status: 'online', lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } })
    ]);
    
    res.json({
      totalUsers,
      totalMessages,
      activeUsers,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
