import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import * as Styled from './Login.styles';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister 
        ? 'http://localhost:3001/api/auth/register'
        : 'http://localhost:3001/api/auth/login';
      
      const response = await axios.post(endpoint, {
        email,
        password,
        username: email.split('@')[0]
      });

      if (response.data.token) {
        login(response.data.user, response.data.token);
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Styled.LoginContainer>
      <Styled.LoginCard>
        <Styled.Logo>NEOCHAT</Styled.Logo>
        <Styled.Title>{isRegister ? 'Criar Conta' : 'Entrar'}</Styled.Title>
        
        {error && <Styled.Error>{error}</Styled.Error>}
        
        <Styled.Form onSubmit={handleSubmit}>
          <Styled.InputGroup>
            <Styled.Label htmlFor="email">Email</Styled.Label>
            <Styled.Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Styled.InputGroup>
          
          <Styled.InputGroup>
            <Styled.Label htmlFor="password">Senha</Styled.Label>
            <Styled.Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Styled.InputGroup>
          
          <Styled.Button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : (isRegister ? 'Registrar' : 'Entrar')}
          </Styled.Button>
        </Styled.Form>
        
        <Styled.ToggleText>
          {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <Styled.ToggleButton 
            type="button" 
            onClick={() => setIsRegister(!isRegister)}
            disabled={loading}
          >
            {isRegister ? 'Entrar' : 'Registrar-se'}
          </Styled.ToggleButton>
        </Styled.ToggleText>
      </Styled.LoginCard>
    </Styled.LoginContainer>
  );
};

export default LoginPage;
