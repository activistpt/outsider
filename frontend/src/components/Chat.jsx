import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/ptBR';
import * as Styled from './Chat.styles';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { user, token, logout } = useAuthStore();
  const { messages, currentRoom, setMessages, addMessage, users, setUsers } = useChatStore();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = socketIOClient('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    // Authentication
    if (token) {
      socketRef.current.emit('authenticate', token);
    }

    // Message events
    socketRef.current.on('authenticated', (data) => {
      console.log('Autenticado:', data);
      socketRef.current.emit('join-room', 'general');
    });

    socketRef.current.on('auth-error', (error) => {
      console.error('Erro de autenticação:', error);
      logout();
    });

    socketRef.current.on('user-connected', (userData) => {
      setUsers(prev => [...prev, userData]);
    });

    socketRef.current.on('user-disconnected', (userData) => {
      setUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    socketRef.current.on('new-message', (messageData) => {
      addMessage(messageData);
      scrollToBottom();
    });

    socketRef.current.on('message-history', (messages) => {
      setMessages(messages);
      scrollToBottom();
    });

    socketRef.current.on('user-typing', ({ userId, username, room }) => {
      if (userId !== user?.userId) {
        setTypingUsers(prev => new Set([...prev, { userId, username, room }]));
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.forEach(item => {
              if (item.userId === userId) newSet.delete(item);
            });
            return newSet;
          });
        }, 2000);
      }
    });

    socketRef.current.on('user-status-update', (userData) => {
      setUsers(prev => prev.map(u => 
        u.userId === userData.userId ? { ...u, status: userData.status } : u
      ));
    });

    // Fetch initial data
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [messagesRes, usersRes] = await Promise.all([
          axios.get('http://localhost:3001/api/messages/general', config),
          axios.get('http://localhost:3001/api/users', config)
        ]);
        setMessages(messagesRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    if (token) {
      fetchData();
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, user?.userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !token) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:3001/api/messages', {
        content: message.trim(),
        room: 'general'
      }, config);
      
      setMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && user?.userId && token) {
      socketRef.current.emit('typing', {
        room: 'general',
        userId: user.userId,
        username: user.username
      });
    }
  };

  const handleStopTyping = () => {
    if (socketRef.current && user?.userId && token) {
      socketRef.current.emit('stop-typing', {
        room: 'general',
        userId: user.userId
      });
    }
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'agora';
    }
  };

  return (
    <Styled.ChatContainer>
      <Styled.ChatHeader>
        <Styled.HeaderInfo>
          <Styled.Logo>NEOCHAT</Styled.Logo>
          <Styled.OnlineCount>{users.filter(u => u.status === 'online').length} usuários online</Styled.OnlineCount>
        </Styled.HeaderInfo>
        <Styled.UserInfo>
          <Styled.UserAvatar>{user?.username?.charAt(0).toUpperCase()}</Styled.UserAvatar>
          <Styled.Username>{user?.username}</Styled.Username>
          <Styled.Status status={user?.status}>{user?.status}</Styled.Status>
          <Styled.LogoutButton onClick={logout}>Sair</Styled.LogoutButton>
        </Styled.UserInfo>
      </Styled.ChatHeader>

      <Styled.ChatContent>
        <Styled.UsersPanel>
          <Styled.UsersTitle>Usuários Online</Styled.UsersTitle>
          <Styled.UsersList>
            {users.map(userData => (
              <Styled.UserItem key={userData.userId}>
                <Styled.UserStatus status={userData.status} />
                <Styled.UserAvatarSmall>{userData.username?.charAt(0).toUpperCase()}</Styled.UserAvatarSmall>
                <Styled.UsernameSmall>{userData.username}</Styled.UsernameSmall>
                <Styled.UserStatusText status={userData.status}>{userData.status}</Styled.UserStatusText>
              </Styled.UserItem>
            ))}
          </Styled.UsersList>
        </Styled.UsersPanel>

        <Styled.MessagesPanel>
          <Styled.MessagesHeader>
            <h3>Salão Geral</h3>
          </Styled.MessagesHeader>
          
          <Styled.MessagesContainer>
            {messages.map(msg => (
              <Styled.MessageWrapper key={msg._id} sender={msg.sender._id === user?.userId ? 'own' : 'other'}>
                {msg.sender._id !== user?.userId && (
                  <Styled.MessageAvatar>
                    {msg.sender.username?.charAt(0).toUpperCase()}
                  </Styled.MessageAvatar>
                )}
                <Styled.MessageBubble sender={msg.sender._id === user?.userId ? 'own' : 'other'}>
                  <Styled.MessageContent>{msg.content}</Styled.MessageContent>
                  <Styled.MessageTime>{formatTime(msg.timestamp)}</Styled.MessageTime>
                </Styled.MessageBubble>
              </Styled.MessageWrapper>
            ))}
            <div ref={messagesEndRef} />
          </Styled.MessagesContainer>

          {typingUsers.size > 0 && (
            <Styled.TypingIndicator>
              {Array.from(typingUsers).map(({ username }) => (
                <span key={username}>{username} está digitando...</span>
              ))}
            </Styled.TypingIndicator>
          )}

          <Styled.MessageInputContainer onSubmit={handleSendMessage}>
            <Styled.MessageInput
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              onKeyDown={handleStopTyping}
              placeholder="Digite sua mensagem..."
              disabled={!token}
            />
            <Styled.SendButton 
              type="submit" 
              disabled={!message.trim() || !token}
            >
              Enviar
            </Styled.SendButton>
          </Styled.MessageInputContainer>
        </Styled.MessagesPanel>
      </Styled.ChatContent>
    </Styled.ChatContainer>
  );
};

export default Chat;
