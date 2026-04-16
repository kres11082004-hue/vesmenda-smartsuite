import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, ActivityLog } from '@/data/mockData';
import { useSync } from './SyncContext';
import { toast } from 'sonner';

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
  refreshAuthData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const sync = useSync();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartsuite_currentUser');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smartsuite_users');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('smartsuite_activities');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  const refreshAuthData = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const [usersRes, activityRes] = await Promise.all([
        fetch(`${apiUrl}/api/users`),
        fetch(`${apiUrl}/api/activities`)
      ]);

      if (usersRes.ok) {
        setRegisteredUsers(await usersRes.json());
      }
      if (activityRes.ok) {
        setActivities(await activityRes.json());
      }
    } catch (e) {
      console.warn('Background sync failed');
    }
  }, []);

  // Initial Fetch from server
  useEffect(() => {
    refreshAuthData();
  }, [refreshAuthData]);

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
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch(err) { console.error(err); }
      }
      if (e.key === 'smartsuite_users' && e.newValue) {
        try { setRegisteredUsers(JSON.parse(e.newValue)); } catch(err) { console.error(err); }
      }
      if (e.key === 'smartsuite_activities' && e.newValue) {
        try { setActivities(JSON.parse(e.newValue)); } catch(err) { console.error(err); }
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

  const logActivityInternal = useCallback((u: User | null, action: string, details: string) => {
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
    setActivities(prev => [newLog, ...prev].slice(0, 500));
    sync.enqueue('LOG_ACTIVITY', newLog);
  }, [sync]);

  const logActivity = (action: string, details: string) => {
    logActivityInternal(user, action, details);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.setItem('smartsuite_activities', JSON.stringify([]));
  };

  const register = (name: string, email: string, role: UserRole, details?: { phone?: string, birthdate?: string, address?: string, avatar?: string }) => {
    if (registeredUsers.find(u => u.email === email)) {
      toast.error('Email already registered');
      return false;
    }
    const newUser: User = { 
      id: `U-${Date.now()}`, 
      name, 
      email, 
      role,
      ...details
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    sync.enqueue('ADD_USER', newUser);
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
    sync.enqueue('UPDATE_USER', { id: user.id, updates: data });
    logActivityInternal(updatedUser, 'Profile Update', `Updated: ${Object.keys(data).join(', ')}`);
  };

  const deleteUser = (userId: string) => {
    if (user?.id === userId) return; // Cannot delete self
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    sync.enqueue('DELETE_USER', { id: userId });
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
    <AuthContext.Provider value={{ user, login, register, logout, updateUserProfile, activities, registeredUsers, logActivity, clearActivities, deleteUser, resetAuthData, refreshAuthData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
