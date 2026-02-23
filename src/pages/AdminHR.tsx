import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockEmployees, Employee } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Banknote, Printer, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface PayrollRecord {
  id: string;
  date: string;
  employees: { name: string; position: string; salary: number }[];
  totalAmount: number;
}

const AdminHR = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: '', position: '', salary: '', phone: '', startDate: '' });

  // Payroll state
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [selectedForPayroll, setSelectedForPayroll] = useState<string[]>([]);
  const [payrollResultOpen, setPayrollResultOpen] = useState(false);
  const [lastPayroll, setLastPayroll] = useState<PayrollRecord | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const payrollPrintRef = useRef<HTMLDivElement>(null);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const activeEmployees = employees.filter(e => e.status === 'Active');

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

  const totalPayroll = activeEmployees.reduce((s, e) => s + e.salary, 0);

  // Payroll functions
  const openPayrollDialog = () => {
    setSelectedForPayroll(activeEmployees.map(e => e.id));
    setPayrollOpen(true);
  };

  const togglePayrollEmployee = (id: string) => {
    setSelectedForPayroll(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedPayrollTotal = employees
    .filter(e => selectedForPayroll.includes(e.id))
    .reduce((s, e) => s + e.salary, 0);

  const processPayroll = () => {
    if (selectedForPayroll.length === 0) {
      toast.error('Select at least one employee');
      return;
    }
    const payrollEmployees = employees
      .filter(e => selectedForPayroll.includes(e.id))
      .map(e => ({ name: e.name, position: e.position, salary: e.salary }));

    const record: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      date: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      employees: payrollEmployees,
      totalAmount: selectedPayrollTotal,
    };

    setLastPayroll(record);
    setPayrollHistory(prev => [record, ...prev]);
    setPayrollOpen(false);
    setPayrollResultOpen(true);
    toast.success(`Payroll processed for ${payrollEmployees.length} employee(s) — ₱${selectedPayrollTotal.toLocaleString()}`);
  };

  const printPayroll = () => {
    if (!payrollPrintRef.current) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Payroll Summary</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #1a1a1a; }
        h2 { margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
        th { font-weight: 600; color: #555; }
        .total-row td { font-weight: 700; border-top: 2px solid #333; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #999; }
      </style></head><body>
      ${payrollPrintRef.current.innerHTML}
      <div class="footer">Printed on ${new Date().toLocaleString()}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR & Payroll</h1>
            <p className="text-muted-foreground text-sm">Manage employees and payroll • Monthly Payroll: <span className="font-semibold text-foreground">₱{totalPayroll.toLocaleString()}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openPayrollDialog}>
              <Banknote className="w-4 h-4 mr-2" />Process Payroll
            </Button>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Add/Edit Employee Dialog */}
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

        {/* Process Payroll Dialog */}
        <Dialog open={payrollOpen} onOpenChange={setPayrollOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Process Payroll</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Select employees to include in this payroll run.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeEmployees.map(emp => (
                <label key={emp.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedForPayroll.includes(emp.id)}
                    onCheckedChange={() => togglePayrollEmployee(emp.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{emp.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{emp.position}</span>
                  </div>
                  <span className="text-sm font-semibold">₱{emp.salary.toLocaleString()}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <span className="text-sm text-muted-foreground">{selectedForPayroll.length} employee(s)</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">₱{selectedPayrollTotal.toLocaleString()}</p>
              </div>
            </div>
            <Button onClick={processPayroll} className="w-full">
              <CheckCircle2 className="w-4 h-4 mr-2" />Confirm & Process
            </Button>
          </DialogContent>
        </Dialog>

        {/* Payroll Result / Print Dialog */}
        <Dialog open={payrollResultOpen} onOpenChange={setPayrollResultOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Payroll Processed ✓</DialogTitle></DialogHeader>
            <div ref={payrollPrintRef}>
              <h2 style={{ margin: 0 }}>Payroll Summary</h2>
              <p className="meta text-sm text-muted-foreground mb-3">{lastPayroll?.date} • Ref: {lastPayroll?.id}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-muted-foreground font-medium">Employee</th>
                    <th className="text-left py-1.5 text-muted-foreground font-medium">Position</th>
                    <th className="text-right py-1.5 text-muted-foreground font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lastPayroll?.employees.map((emp, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5">{emp.name}</td>
                      <td className="py-1.5">{emp.position}</td>
                      <td className="py-1.5 text-right">₱{emp.salary.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2" colSpan={2}>Total Payroll</td>
                    <td className="py-2 text-right">₱{lastPayroll?.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button onClick={printPayroll} variant="outline" className="w-full">
              <Printer className="w-4 h-4 mr-2" />Print Payroll Summary
            </Button>
          </DialogContent>
        </Dialog>

        {/* Employee Table */}
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
