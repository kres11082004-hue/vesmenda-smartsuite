import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSync } from '@/contexts/SyncContext';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/data/mockData';
import { Menu, CloudOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function DashboardLayout({ children, allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { status, queueLength, forceSync } = useSync();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full relative bg-cover bg-center bg-fixed overflow-hidden"
        style={{ backgroundImage: "url('/store-bg.jpg')" }}
      >
        {/* Sharp Background Watermark */}

        {/* Enhanced Dark Glass Overlay */}
        <div className="absolute inset-0 bg-black/80 pointer-events-none z-0" />

        <div className="relative z-10 flex w-full h-screen overflow-hidden">
          <AppSidebar />
          <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <header className="h-14 shrink-0 flex items-center gap-4 px-6 border-b border-border/50 bg-card/40">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex-1" />
            
            {/* Sync Badge */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium border cursor-pointer transition-colors ${
                status === 'online' ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' :
                status === 'offline' ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' :
                status === 'syncing' ? 'bg-primary/10 text-primary border-primary/20 cursor-wait' :
                'bg-destructive/10 text-destructive border-destructive/20'
              }`}
              onClick={() => {
                if (status === 'offline' && queueLength > 0 && !navigator.onLine) toast.error('Check your internet connection to sync.');
                else if (status === 'online' || status === 'error' || (status === 'offline' && queueLength > 0 && navigator.onLine)) forceSync();
              }}
              title={queueLength > 0 ? `${queueLength} changes pending sync` : 'All data synced'}
            >
              {status === 'online' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {status === 'offline' && <CloudOff className="w-3.5 h-3.5" />}
              {status === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
              
              <span className="hidden sm:inline">
                {status === 'online' ? 'Synced' :
                 status === 'offline' ? `Pending (${queueLength})` :
                 status === 'syncing' ? 'Syncing...' : 'Sync Error'}
              </span>
            </div>

            <div className="w-px h-4 bg-border hidden sm:block" />

            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
