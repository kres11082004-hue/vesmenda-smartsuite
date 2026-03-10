import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(mockUsers);

  const login = (email: string, _password: string) => {
    const found = registeredUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, role: UserRole) => {
    if (registeredUsers.find(u => u.email === email)) return false;
    const newUser: User = { id: `U-${Date.now()}`, name, email, role };
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
