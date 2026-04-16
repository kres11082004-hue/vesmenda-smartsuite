import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useSync } from '@/contexts/SyncContext';

export const RealTimeSync = () => {
  const { refreshAuthData } = useAuth();
  const { refreshStoreData } = useStore();
  const { status, queueLength } = useSync();

  useEffect(() => {
    // Only refresh if we are online and have no pending updates to push
    // to avoid potential race conditions between local push and cloud pull
    const intervalTime = 30000; // 30 seconds heartbeat
    
    const heartbeat = setInterval(() => {
      if (navigator.onLine && queueLength === 0) {
        console.log('Sync heartbeat: Pulling latest data from cloud');
        refreshAuthData();
        refreshStoreData();
      }
    }, intervalTime);

    return () => clearInterval(heartbeat);
  }, [refreshAuthData, refreshStoreData, queueLength]);

  return null; // This is a logic-only component
};
