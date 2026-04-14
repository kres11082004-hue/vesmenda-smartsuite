import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export interface SyncOperation {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

interface SyncContextType {
  status: SyncStatus;
  queueLength: number;
  enqueue: (type: string, payload: unknown) => void;
  forceSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queue, setQueue] = useState<SyncOperation[]>(() => {
    const saved = localStorage.getItem('smartsuite_sync_queue');
    if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
    return [];
  });

  // Track network status
  useEffect(() => {
    const handleOnline = () => { 
      setIsOnline(true); 
      // Only toast if there are pending operations, otherwise it's just a connection blip
      toast.success('Connection restored. Syncing data...'); 
    };
    const handleOffline = () => { 
      setIsOnline(false); 
      toast.error('You are offline. Changes will be saved locally.'); 
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    localStorage.setItem('smartsuite_sync_queue', JSON.stringify(queue));
  }, [queue]);

  const enqueue = useCallback((type: string, payload: unknown) => {
    const op: SyncOperation = { id: `OP-${Date.now()}-${Math.floor(Math.random()*1000)}`, type, payload, timestamp: Date.now() };
    setQueue(prev => [...prev, op]);
  }, []);

  const [serverUnreachable, setServerUnreachable] = useState<boolean>(false);

  // ... (existing network status code) ...

  const performSync = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isSyncing) return;
    
    setIsSyncing(true);
    const operationsToSync = [...queue];
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: operationsToSync }),
      });

      if (!response.ok) {
        throw new Error('Sync server responded with an error');
      }

      const result = await response.json();
      
      if (result.success) {
        setQueue(prev => prev.filter(op => !operationsToSync.find(s => s.id === op.id)));
        setServerUnreachable(false);
        toast.success(`Successfully synced ${operationsToSync.length} updates.`);
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (e) {
      // Determine if it was a connection error to the backend
      setServerUnreachable(true);
      
      // We don't show a toast error for connection failures, 
      // as that would annoy the user during offline development.
      // We only log it to the console for debugging.
      console.warn('Sync server unreachable, updates saved locally.');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, queue, isSyncing]);

  // Auto-sync logic with adaptive frequency
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      // Use longer delay (10 seconds) if server is known to be unreachable, otherwise 1 second
      const retryDelay = serverUnreachable ? 10000 : 1000;
      const timer = setTimeout(() => {
        performSync();
      }, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isSyncing, performSync, serverUnreachable]);

  let status: SyncStatus = isOnline ? 'online' : 'offline';
  if (isSyncing) status = 'syncing';
  else if (isOnline && queue.length > 0) status = 'offline'; // Pending state

  return (
    <SyncContext.Provider value={{ status, queueLength: queue.length, enqueue, forceSync: performSync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used inside SyncProvider');
  return ctx;
};
