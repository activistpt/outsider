import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import useAuthStore from '../store/authStore';

const queryClient = new QueryClient();

const App = () => {
  const { user, token } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <LoginPage /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/chat" 
            element={token ? <ChatPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? '/chat' : '/login'} />} 
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
