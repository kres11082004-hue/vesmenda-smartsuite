import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockEmployees, Employee } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const AdminHR = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: '', position: '', salary: '', phone: '', startDate: '' });

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditItem(null); setForm({ name: '', position: '', salary: '', phone: '', startDate: '' }); setDialogOpen(true); };
  const openEdit = (e: Employee) => { setEditItem(e); setForm({ name: e.name, position: e.position, salary: e.salary.toString(), phone: e.phone, startDate: e.startDate }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editItem) {
      setEmployees(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form, salary: +form.salary } : e));
      toast.success('Employee updated');
    } else {
      setEmployees(prev => [...prev, { id: `EMP-${Date.now()}`, ...form, salary: +form.salary, status: 'Active' as const, department: '' }]);
      toast.success('Employee added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setEmployees(prev => prev.filter(e => e.id !== id)); toast.success('Employee removed'); };

  const totalPayroll = employees.filter(e => e.status === 'Active').reduce((s, e) => s + e.salary, 0);

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR & Payroll</h1>
            <p className="text-muted-foreground text-sm">Manage employees and payroll • Monthly Payroll: <span className="font-semibold text-foreground">₱{totalPayroll.toLocaleString()}</span></p>
          </div>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Employee</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Position</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
              <div className="space-y-1"><Label>Salary</Label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-span-2 space-y-1"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            </div>
            <Button onClick={handleSave} className="mt-2">Save</Button>
          </DialogContent>
        </Dialog>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Employee</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Position</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Salary</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3">
                    <div><span className="font-medium">{emp.name}</span><br /><span className="text-xs text-muted-foreground">{emp.phone}</span></div>
                  </td>
                  <td className="py-2.5 px-3">{emp.position}</td>
                  <td className="py-2.5 px-3 text-right">₱{emp.salary.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={emp.status === 'Active' ? 'default' : emp.status === 'On Leave' ? 'secondary' : 'destructive'} className="text-xs">
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(emp)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(emp.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminHR;
