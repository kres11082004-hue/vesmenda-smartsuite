import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockExpenses, mockSales, Expense } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { StatCard } from '@/components/StatCard';

const AdminFinance = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ date: '', category: '', description: '', amount: '' });

  const totalRevenue = mockSales.reduce((s, t) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleAdd = () => {
    if (!form.description || !form.amount) { toast.error('Fill required fields'); return; }
    setExpenses(prev => [...prev, { id: `EXP-${Date.now()}`, date: form.date || new Date().toISOString().split('T')[0], category: form.category, description: form.description, amount: +form.amount }]);
    toast.success('Expense added');
    setDialogOpen(false);
    setForm({ date: '', category: '', description: '', amount: '' });
  };

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Finance & Accounting</h1>
            <p className="text-muted-foreground text-sm">Track expenses and profit</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Expense</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={TrendingUp} changeType="positive" change="From sales" />
          <StatCard title="Total Expenses" value={`₱${totalExpenses.toLocaleString()}`} icon={TrendingDown} changeType="negative" change="This period" />
          <StatCard title="Net Profit" value={`₱${netProfit.toLocaleString()}`} icon={DollarSign} changeType={netProfit > 0 ? "positive" : "negative"} change={netProfit > 0 ? "Profitable" : "Loss"} />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Utilities" /></div>
              <div className="col-span-2 space-y-1"><Label>Description *</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-2 space-y-1"><Label>Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <Button onClick={handleAdd} className="mt-2">Save Expense</Button>
          </DialogContent>
        </Dialog>

        <div className="stat-card overflow-x-auto">
          <h3 className="font-semibold mb-4">Expense Records</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Description</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3">{exp.date}</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">{exp.category}</span></td>
                  <td className="py-2.5 px-3">{exp.description}</td>
                  <td className="py-2.5 px-3 text-right font-medium">₱{exp.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setExpenses(prev => prev.filter(e => e.id !== exp.id)); toast.success('Deleted'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
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

export default AdminFinance;
