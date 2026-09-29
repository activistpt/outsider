import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Logo = styled.h1`
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.8rem;
  font-weight: 700;
`;

export const OnlineCount = styled.span`
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 500;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

export const Username = styled.span`
  font-weight: 600;
  color: #333;
`;

export const Status = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.online {
    background: #e8f5e9;
    color: #4caf50;
  }
  
  &.offline {
    background: #f5f5f5;
    color: #9e9e9e;
  }
  
  &.away {
    background: #fff3e0;
    color: #ff9800;
  }
`;

export const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #ff5252;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #d32f2f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  }
`;

export const ChatContent = styled.div`
  display: flex;
  flex: 1;
  padding: 2rem;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

export const UsersPanel = styled.div`
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

export const UsersTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.3rem;
`;

export const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 10px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e3f2fd;
    transform: translateX(5px);
  }
`;

export const UserAvatarSmall = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

export const UsernameSmall = styled.span`
  font-weight: 600;
  color: #333;
  flex: 1;
`;

export const UserStatusText = styled.span`
  font-size: 0.75rem;
  
  &.online {
    color: #4caf50;
  }
  
  &.offline {
    color: #9e9e9e;
  }
  
  &.away {
    color: #ff9800;
  }
`;

export const MessagesPanel = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const MessagesHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
  }
`;

export const MessagesContainer = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MessageWrapper = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: flex-end;
  justify-content: ${props => props.sender === 'own' ? 'flex-end' : 'flex-start'};
  margin-bottom: 1rem;
`;

export const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

export const MessageBubble = styled.div`
  max-width: 70%;
  padding: 1rem 1.2rem;
  border-radius: ${props => props.sender === 'own' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.sender === 'own' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f5f5f5'};
  color: ${props => props.sender === 'own' ? 'white' : '#333'};
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const MessageContent = styled.p`
  margin: 0 0 0.3rem 0;
  line-height: 1.4;
  word-wrap: break-word;
`;

export const MessageTime = styled.span`
  font-size: 0.7rem;
  opacity: 0.7;
  display: block;
  text-align: right;
  margin-top: 0.3rem;
`;

export const TypingIndicator = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
`;

export const MessageInputContainer = styled.form`
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

export const MessageInput = styled.textarea`
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  resize: none;
  min-height: 45px;
  max-height: 120px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

export const SendButton = styled.button`
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const UserStatus = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  
  ${props => {
    if (props.status === 'online') return 'background: #4caf50;';
    if (props.status === 'away') return 'background: #ff9800;';
    return 'background: #9e9e9e;';
  }}
`;
