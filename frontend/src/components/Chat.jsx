import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useChatStore from '../stores/chatStore';
import '../Chat.styles';

const Chat = () => {
  const { user, logout } = useAuthStore();
  const { messages, addMessage, setMessages, onlineUsers, connectSocket } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    connectSocket();

    return () => {
      // Cleanup on unmount
    };
  }, [connectSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addMessage({
        id: Date.now(),
        text: newMessage,
        sender: user,
        timestamp: new Date().toISOString(),
        type: 'text'
      });
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <h2>👤 {user?.name || user?.username}</h2>
          <span className="status">🟢 Online</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Sair
        </button>
      </div>

      <div className="chat-content">
        <div className="messages-sidebar">
          <h3>👥 Usuários Online ({onlineUsers.length})</h3>
          <ul className="users-list">
            {onlineUsers.map((onlineUser) => (
              <li key={onlineUser.id} className="user-item">
                <span className="user-avatar">
                  {onlineUser.name?.charAt(0) || onlineUser.username?.charAt(0)}
                </span>
                <span className="user-name">{onlineUser.name || onlineUser.username}</span>
                <span className="status-dot">●</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="messages-area">
          <div className="messages-header">
            <h3>💬 Chat Geral</h3>
            <span className="message-count">
              {messages.length} mensagens
            </span>
          </div>

          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>👋 Seja bem-vindo ao NEOCHAT!</p>
                <p>Envie sua primeira mensagem para começar.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender?.id === user?.id ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-header">
                    <span className="sender-name">
                      {message.sender?.name || message.sender?.username || 'Usuário'}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="typing-indicator">
            {isTyping && <span>Usuário está digitando...</span>}
          </div>

          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              placeholder="Digite sua mensagem..."
              className="message-input"
            />
            <button type="submit" className="send-button" disabled={!newMessage.trim()}>
              🚀 Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;