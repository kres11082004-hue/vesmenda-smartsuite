import {
  LayoutDashboard, ShoppingCart, Package, Users, DollarSign,
  FileText, LogOut, Store, ScanBarcode
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';

const ownerLinks = [
  { title: 'Dashboard', url: '/owner', icon: LayoutDashboard },
  { title: 'Sales Reports', url: '/owner/sales', icon: ShoppingCart },
  { title: 'Inventory', url: '/owner/inventory', icon: Package },
  { title: 'HR & Payroll', url: '/owner/hr', icon: Users },
  { title: 'Finance', url: '/owner/finance', icon: DollarSign },
];

const adminLinks = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Sales', url: '/admin/sales', icon: ShoppingCart },
  { title: 'Inventory', url: '/admin/inventory', icon: Package },
  { title: 'HR & Payroll', url: '/admin/hr', icon: Users },
  { title: 'Finance', url: '/admin/finance', icon: DollarSign },
  { title: 'Reports', url: '/admin/reports', icon: FileText },
];

const cashierLinks = [
  { title: 'POS Terminal', url: '/cashier', icon: ScanBarcode },
  { title: 'Transactions', url: '/cashier/transactions', icon: ShoppingCart },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'owner' ? ownerLinks : user?.role === 'admin' ? adminLinks : cashierLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Sidebar className="border-r-0 sidebar-glow">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-accent-foreground text-sm">Vesmenda's</h2>
            <p className="text-xs text-sidebar-foreground capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest mb-2 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
