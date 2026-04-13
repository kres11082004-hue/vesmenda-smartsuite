import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, mockUsers, ActivityLog } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  register: (name: string, email: string, role: UserRole, details?: { phone?: string, birthdate?: string, address?: string, avatar?: string }) => boolean;
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;
  activities: ActivityLog[];
  registeredUsers: User[];
  logActivity: (action: string, details: string) => void;
  clearActivities: () => void;
  deleteUser: (userId: string) => void;
  resetAuthData: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartsuite_currentUser');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smartsuite_users');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockUsers;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('smartsuite_activities');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('smartsuite_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartsuite_currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smartsuite_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('smartsuite_activities', JSON.stringify(activities.slice(-200))); // Keep last 200
  }, [activities]);

  // Listen for storage changes to handle multi-tab auth sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartsuite_currentUser') {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch(err) {}
      }
      if (e.key === 'smartsuite_users' && e.newValue) {
        try { setRegisteredUsers(JSON.parse(e.newValue)); } catch(err) {}
      }
      if (e.key === 'smartsuite_activities' && e.newValue) {
        try { setActivities(JSON.parse(e.newValue)); } catch(err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (email: string, _password: string): User | null => {
    const found = registeredUsers.find(u => u.email === email) || null;
    if (found) {
      setUser(found);
      logActivityInternal(found, 'Login', `User logged in via ${email}`);
    }
    return found;
  };

  const logActivityInternal = (u: User | null, action: string, details: string) => {
    if (!u) return;
    const newLog: ActivityLog = {
      id: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: u.id,
      userName: u.name,
      userRole: u.role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [...prev, newLog]);
  };

  const logActivity = (action: string, details: string) => {
    logActivityInternal(user, action, details);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.setItem('smartsuite_activities', JSON.stringify([]));
  };

  const register = (name: string, email: string, role: UserRole, details?: { phone?: string, birthdate?: string, address?: string, avatar?: string }) => {
    if (registeredUsers.find(u => u.email === email)) return false;
    const newUser: User = { 
      id: `U-${Date.now()}`, 
      name, 
      email, 
      role,
      ...details
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    logActivityInternal(newUser, 'Registration', `New ${role} account created`);
    return true;
  };

  const logout = () => {
    if (user) logActivityInternal(user, 'Logout', 'User logged out');
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    logActivityInternal(updatedUser, 'Profile Update', `Updated: ${Object.keys(data).join(', ')}`);
  };

  const deleteUser = (userId: string) => {
    if (user?.id === userId) return; // Cannot delete self
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetAuthData = () => {
    setActivities([]);
    if (user) {
      setRegisteredUsers([user]);
    } else {
      setRegisteredUsers([]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserProfile, activities, registeredUsers, logActivity, clearActivities, deleteUser, resetAuthData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
