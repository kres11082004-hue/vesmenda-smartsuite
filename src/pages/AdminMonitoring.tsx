import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Activity, ShieldCheck, Clock, Search, 
  Filter, User as UserIcon, LogIn, LogOut, 
  ShoppingCart, Package, Edit, UserPlus, Trash2 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User as UserType } from '@/data/mockData';
import { useStore } from '@/contexts/StoreContext';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminMonitoring = () => {
  const { activities, registeredUsers, user, clearActivities, deleteUser, resetAuthData } = useAuth();
  const { resetStoreData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  // Filter activities
  const filteredActivities = activities
    .filter(a => {
      const matchesSearch = 
        a.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || a.userRole === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Stats
  // onlineUsers logic can be refined, but for now we use activity logs
  const userList = registeredUsers.map(u => {
    const userActivities = activities.filter(a => a.userId === u.id);
    const lastActivity = userActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const isOnline = lastActivity?.action === 'Login'; // Simple mock logic
    return { ...u, lastActivity, isOnline };
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Login': return <LogIn className="w-4 h-4 text-green-500" />;
      case 'Logout': return <LogOut className="w-4 h-4 text-orange-500" />;
      case 'Registration': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'Sale Completed': return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'Product Added': return <Package className="w-4 h-4 text-indigo-500" />;
      case 'Product Updated': return <Edit className="w-4 h-4 text-amber-500" />;
      case 'Profile Update': return <UserIcon className="w-4 h-4 text-cyan-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleActivityClick = (log: any) => {
    if (log.action === 'Sale Completed') {
      navigate('/owner/sales');
    } else if (log.action.includes('Product')) {
      navigate('/owner/inventory');
    } else if (log.action === 'Registration' || log.action === 'Profile Update') {
      const u = registeredUsers.find(ru => ru.id === log.userId);
      if (u) setSelectedUser(u);
    }
  };

  const handleSystemReset = () => {
    if (confirm('DANGER: This will permanently delete ALL sales, products, expenses, logs, and users (except you). \n\nAre you absolutely sure you want to reset the entire system?')) {
      resetAuthData();
      resetStoreData();
      toast.success('System has been completely reset');
    }
  };

  return (
    <DashboardLayout allowedRoles={['owner']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <ShieldCheck className="w-6 h-6 text-violet-300" />
              User Activity Monitor
            </h1>
            <p className="text-violet-200 text-sm">Real-time surveillance of system users and actions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Registered Users" 
            value={registeredUsers.length.toString()} 
            icon={Users} 
            change="All staff roles"
            changeType="neutral"
          />
          <StatCard 
            title="Total Recorded Logs" 
            value={activities.length.toString()} 
            icon={Activity} 
            change="Rolling buffer (200)"
            changeType="neutral"
          />
          <StatCard 
            title="System Role Check" 
            value="SECURE" 
            icon={ShieldCheck} 
            change="Permissions verified"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* User Status List */}
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 ml-1 drop-shadow-md">
              <UserIcon className="w-5 h-5" /> User Status
            </h3>
            <div className="stat-card p-0 overflow-hidden divide-y divide-gray-100 border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <div className="max-h-[600px] overflow-auto">
                {userList.map(u => (
                  <div 
                    key={u.id} 
                    className="p-4 flex items-center gap-4 hover:bg-white/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm overflow-hidden text-gray-500">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-4 py-0 leading-none px-1 uppercase">{u.role}</Badge>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {u.lastActivity ? new Date(u.lastActivity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {u.lastActivity && (
                           <Badge variant="outline" className="text-[9px] text-gray-400 p-0 font-normal border-none">
                             {u.lastActivity.action}
                           </Badge>
                        )}
                      </div>
                      
                      {/* Delete User Button (Hidden by default, shown on group hover) */}
                      {user?.id !== u.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-gray-300 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${u.name} from the system?`)) {
                              deleteUser(u.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 ml-1 self-start drop-shadow-md">
                <Clock className="w-5 h-5" /> Detailed Activity Feed
              </h3>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px] font-bold"
                  onClick={clearActivities}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  CLEAR LOGS
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-9 rounded-xl text-[10px] font-bold shadow-lg shadow-destructive/20"
                  onClick={handleSystemReset}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  RESET SYSTEM DATA
                </Button>
                <div className="relative flex-1 md:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search actions..." 
                    className="pl-9 h-9 rounded-xl border-gray-200 bg-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                  <Badge 
                    onClick={() => setFilterRole('all')}
                    className={`cursor-pointer px-3 ${filterRole === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                  >All</Badge>
                  <Badge 
                    onClick={() => setFilterRole('cashier')}
                    className={`cursor-pointer px-3 ${filterRole === 'cashier' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                  >Cashier</Badge>
                  <Badge 
                    onClick={() => setFilterRole('admin')}
                    className={`cursor-pointer px-3 ${filterRole === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                  >Staff</Badge>
                </div>
              </div>
            </div>

            <div className="stat-card p-0 overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <div className="max-h-[600px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">Timestamp</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Action</th>
                      <th className="text-left py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-gray-400 bg-gray-50/20">
                          <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p>No activities found matching your criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map(log => (
                        <tr 
                          key={log.id} 
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                          onClick={() => handleActivityClick(log)}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-gray-400 text-xs font-mono group-hover:text-blue-600 transition-colors">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour12: true })}
                            </span>
                            <br />
                            <span className="text-[10px] text-gray-300">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-700">{log.userName}</span>
                              <Badge variant="outline" className="text-[9px] h-3 py-0 px-1 border border-gray-200 uppercase font-bold">
                                {log.userRole === 'admin' ? 'Staff' : log.userRole}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {log.userId.slice(-6)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                              {getActionIcon(log.action)}
                              {log.action}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 italic max-w-xs truncate">
                            {log.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden border-none shadow-2xl">
          <DialogHeader className="pt-6 px-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">User Profile Detail</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 pt-4 pb-8 px-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl overflow-hidden text-white">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedUser.name.charAt(0)
                    )}
                  </div>
                  <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${userList.find(u => u.id === selectedUser.id)?.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <Badge className="mt-1 uppercase bg-blue-100 text-blue-700 border-none px-4 rounded-full">{selectedUser.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Contact Information</p>
                  <div className="flex items-center gap-2 text-gray-700 font-medium italic">
                    {selectedUser.email}
                  </div>
                  {selectedUser.phone && (
                    <div className="text-gray-600 font-medium">#{selectedUser.phone}</div>
                  )}
                </div>
                
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Personal Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400">BIRTHDATE</p>
                      <p className="text-gray-700 font-medium">{selectedUser.birthdate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">ADDRESS</p>
                      <p className="text-gray-700 font-medium truncate">{selectedUser.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 space-y-2">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Last Known Action</p>
                   <div className="flex items-center gap-2 text-blue-700 font-bold">
                     {getActionIcon(userList.find(u => u.id === selectedUser.id)?.lastActivity?.action || '')}
                     {userList.find(u => u.id === selectedUser.id)?.lastActivity?.action || 'No recent activity'}
                   </div>
                   <p className="text-[10px] text-blue-400 italic">
                     {userList.find(u => u.id === selectedUser.id)?.lastActivity?.details || 'N/A'}
                   </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminMonitoring;
