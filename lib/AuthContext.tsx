'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  avatar?: string;
  wallpaper?: string;
  contacts?: { phoneNumber: string; name: string }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  socket: Socket | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('vailnet_user');
    const storedToken = localStorage.getItem('vailnet_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection when user is logged in
    let newSocket: Socket;
    if (user && token) {
      // Connect to backend URL (localhost:5000 for development)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      newSocket = io(backendUrl);
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('user_join', user.id);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user, token]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('vailnet_user', JSON.stringify(userData));
    localStorage.setItem('vailnet_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vailnet_user');
    localStorage.removeItem('vailnet_token');
    if (socket) socket.disconnect();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('vailnet_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
